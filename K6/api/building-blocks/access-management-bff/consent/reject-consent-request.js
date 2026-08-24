import { check } from "k6";

import { ConsentClient } from "../../../../clients/access-management-bff/consent/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Rejects a consent request.
 *
 * @param {ConsentClient} consentClient Client for the consent endpoints.
 * @param {string} consentRequestId Consent request UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the consent request was rejected.
 */
export function RejectConsentRequest(
    consentClient,
    consentRequestId,
    labels = null,
) {
    const res = withRetries(
        () => consentClient.RejectConsentRequest(consentRequestId, labels),
        "RejectConsentRequest",
    );

    let rejected = false;

    const succeed = check(res, {
        "RejectConsentRequest - status code is 200": (r) =>
            r.status === 200,
        "RejectConsentRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rejected;
    }

    rejected = true;

    return rejected;
}
