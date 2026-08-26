import { check } from "k6";

import { OpenidClient } from "../../../../clients/authentication/openid.js";
import { JwksDocument } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Reads the JSON Web Key Set the environment signs its tokens with.
 *
 * The URL is a parameter so a test can follow the `jwks_uri` it read from the
 * discovery document instead of a URL this repo built. Reading it the way a relying
 * party would is the only thing that proves the advertised URL serves keys, and it
 * is also what catches a document that points at another environment.
 *
 * @param {OpenidClient} openidClient Client for the OpenID metadata endpoints.
 * @param {string|null} [url] Absolute URL to read. Defaults to the path under the client's base URL.
 * @param {number} [expectedStatus] Status the caller expects. Defaults to 200.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {JwksDocument|null} The key set, or null when the call did not return one.
 */
export function GetKeySet(
    openidClient,
    url = null,
    expectedStatus = 200,
    labels = null,
) {
    const res = withRetries(
        () => openidClient.GetKeySet(url, labels),
        "GetKeySet",
    );

    const succeed = check(res, {
        [`GetKeySet - status code is ${expectedStatus}`]: (r) =>
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

    /** @type {JwksDocument|null} */
    let keySet = null;

    check(res, {
        "GetKeySet - body is valid": (r) => {
            try {
                const parsed = JSON.parse(r.body);

                // A bare JSON scalar parses fine but is not a key set, and letting it
                // through would report the failure on the key checks after this one.
                if (typeof parsed !== "object" || parsed === null) {
                    console.log(`Body is not a key set: ${r.body}`);

                    return false;
                }

                keySet = parsed;

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return keySet;
}
