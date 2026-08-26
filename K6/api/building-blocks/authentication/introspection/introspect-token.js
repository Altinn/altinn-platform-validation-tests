import { check } from "k6";

import { IntrospectionClient } from "../../../../clients/authentication/introspection.js";
import { IntrospectionResponse } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Asks whether a token is valid.
 *
 * A caller that expects a rejection passes that status, so a 401 the test asked for
 * reads as a pass rather than as a failed check. It can pass what the rejection has
 * to say as well, which is what separates the endpoint's own refusal from any other
 * response carrying the same status, such as one from APIM in front of it.
 *
 * @param {IntrospectionClient} introspectionClient Client for the Introspection API.
 * @param {object} [options] What to send. See the client method.
 * @param {number} [expectedStatus] Status the caller expects. Defaults to 200.
 * @param {RegExp|null} [expectedMessage] What the rejection has to say. Only checked when passed.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {IntrospectionResponse|null} The introspection response, or null when the call did not answer with one.
 */
export function IntrospectToken(
    introspectionClient,
    options = {},
    expectedStatus = 200,
    expectedMessage = null,
    labels = null,
) {
    const res = withRetries(
        () => introspectionClient.Introspect(options, labels),
        "IntrospectToken",
    );

    const succeed = check(res, {
        [`IntrospectToken - status code is ${expectedStatus}`]: (r) =>
            r.status === expectedStatus,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return null;
    }

    if (expectedMessage !== null) {
        const said = check(res, {
            "IntrospectToken - the answer says why": (r) =>
                expectedMessage.test(r.body ?? ""),
        });

        if (!said) {
            console.log(res.body);
        }
    }

    if (expectedStatus !== 200) {
        return null;
    }

    /** @type {IntrospectionResponse|null} */
    let introspection = null;

    check(res, {
        "IntrospectToken - body is valid": (r) => {
            try {
                const parsed = JSON.parse(r.body);

                // A bare JSON scalar parses fine but is not an answer, and letting it
                // through would report the failure on the check after this one.
                if (typeof parsed !== "object" || parsed === null) {
                    console.log(`Body is not an introspection answer: ${r.body}`);

                    return false;
                }

                introspection = parsed;

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return introspection;
}
