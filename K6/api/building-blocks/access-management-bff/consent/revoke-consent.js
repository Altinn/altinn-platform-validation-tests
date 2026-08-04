import { check } from "k6";

import { ConsentClient } from "../../../../clients/access-management-bff/consent/index.js";

/**
 * Revokes a consent.
 *
 * @param {ConsentClient} consentClient Client for the consent endpoints.
 * @param {string} consentId Consent UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the consent was revoked.
 */
export function RevokeConsent(consentClient, consentId, labels = null) {
    const res = consentClient.RevokeConsent(consentId, labels);

    let revoked = false;

    const succeed = check(res, {
        "RevokeConsent - status code is 200": (r) =>
            r.status === 200,
        "RevokeConsent - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return revoked;
    }

    revoked = true;

    return revoked;
}
