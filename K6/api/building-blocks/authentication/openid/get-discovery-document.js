import { check } from "k6";

import { OpenidClient } from "../../../../clients/authentication/openid.js";
import { DiscoveryDocument } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Reads the OpenID Connect discovery document.
 *
 * A caller that expects a rejection passes that status, so a refusal the test asked
 * for reads as a pass rather than as a failed check.
 *
 * The parsed document is returned rather than the response, because everything a
 * test does with it, comparing the issuer, following `jwks_uri`, is done on the
 * fields. A body that is not a JSON object turns the parse check red and comes back
 * as null, so the caller can stop instead of reporting every field as missing.
 *
 * @param {OpenidClient} openidClient Client for the OpenID metadata endpoints.
 * @param {number} [expectedStatus] Status the caller expects. Defaults to 200.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {DiscoveryDocument|null} The discovery document, or null when the call did not return one.
 */
export function GetDiscoveryDocument(
    openidClient,
    expectedStatus = 200,
    labels = null,
) {
    const res = withRetries(
        () => openidClient.GetDiscoveryDocument(labels),
        "GetDiscoveryDocument",
    );

    const succeed = check(res, {
        [`GetDiscoveryDocument - status code is ${expectedStatus}`]: (r) =>
            r.status === expectedStatus,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return null;
    }

    if (expectedStatus !== 200) {
        return null;
    }

    /** @type {DiscoveryDocument|null} */
    let discovery = null;

    check(res, {
        "GetDiscoveryDocument - body is valid": (r) => {
            try {
                const parsed = JSON.parse(r.body);

                // A bare JSON scalar parses fine but is not a document, and letting it
                // through would report the failure on every field check after this one.
                if (typeof parsed !== "object" || parsed === null) {
                    console.log(`Body is not a discovery document: ${r.body}`);

                    return false;
                }

                discovery = parsed;

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return discovery;
}
