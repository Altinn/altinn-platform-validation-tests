import { check } from "k6";

import { AuthenticationClient } from "../../../../clients/authentication/authentication.js";
import { withRetries } from "../../common/retry.js";

/**
 * Exchanges an external token for an Altinn token.
 *
 * The endpoint answers with the token as a bare string rather than an object, so
 * there is nothing to parse: the surrounding quotes a JSON-serialized string would
 * carry are stripped and the token handed back as it will be used.
 *
 * A caller that expects a rejection passes that status, so a 401 the test asked for
 * reads as a pass rather than as a failed check.
 *
 * @param {AuthenticationClient} authenticationClient Client for the Authentication API.
 * @param {string} tokenProvider The provider that issued the token, e.g. "maskinporten".
 * @param {object} [options] What to send. See the client method.
 * @param {number} [expectedStatus] Status the caller expects. Defaults to 200.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {string|null} The Altinn token, or null when the call did not answer with one.
 */
export function ExchangeToken(
    authenticationClient,
    tokenProvider,
    options = {},
    expectedStatus = 200,
    labels = null,
) {
    const res = withRetries(
        () => authenticationClient.ExchangeToken(tokenProvider, options, labels),
        "ExchangeToken",
    );

    const succeed = check(res, {
        [`ExchangeToken - status code is ${expectedStatus}`]: (r) =>
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

    return (res.body ?? "").trim().replace(/^"|"$/g, "");
}
