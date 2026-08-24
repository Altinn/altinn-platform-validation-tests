import { check } from "k6";

import { ConsentClient } from "../../../../clients/access-management-bff/consent/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets a consent request.
 *
 * @param {ConsentClient} consentClient Client for the consent endpoints.
 * @param {string} consentRequestId Consent request UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {any} The consent request. The API does not publish a
 * schema for this response.
 */
export function GetConsentRequest(
    consentClient,
    consentRequestId,
    labels = null,
) {
    const res = withRetries(
        () => consentClient.GetConsentRequest(consentRequestId, labels),
        "GetConsentRequest",
    );

    /** @type {any} */
    let consentRequest = null;

    const succeed = check(res, {
        "GetConsentRequest - status code is 200": (r) =>
            r.status === 200,
        "GetConsentRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return consentRequest;
    }

    check(res, {
        "GetConsentRequest - body is valid": (r) => {
            try {
                consentRequest = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return consentRequest;
}
