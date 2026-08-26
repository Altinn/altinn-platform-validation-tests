import { check } from "k6";

import { ApproveConsentContext } from "../../../../clients/access-management-bff/common/common.types.js";
import { ConsentClient } from "../../../../clients/access-management-bff/consent/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Approves a consent request.
 *
 * @param {ConsentClient} consentClient Client for the consent endpoints.
 * @param {string} consentRequestId Consent request UUID.
 * @param {ApproveConsentContext|null} [body] Context for the approval. Use
 * {@link ApproveConsentContextBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the consent request was approved.
 */
export function ApproveConsentRequest(
    consentClient,
    consentRequestId,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () =>
            consentClient.ApproveConsentRequest(
                consentRequestId,
                body,
                labels,
            ),
        "ApproveConsentRequest",
    );

    let approved = false;

    const succeed = check(res, {
        "ApproveConsentRequest - status code is 200": (r) =>
            r.status === 200,
        "ApproveConsentRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return approved;
    }

    approved = true;

    return approved;
}
