import { check } from "k6";

import { ConsentClient } from "../../../../clients/access-management-bff/consent/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the logout redirect for a consent request.
 *
 * @param {ConsentClient} consentClient Client for the consent endpoints.
 * @param {string} consentRequestId Consent request UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {http.RefinedResponse<"text">} The raw response, holding the redirect
 * target.
 */
export function GetConsentRequestLogout(
    consentClient,
    consentRequestId,
    labels = null,
) {
    const res = withRetries(
        () =>
            consentClient.GetConsentRequestLogout(
                consentRequestId,
                labels,
            ),
        "GetConsentRequestLogout",
    );

    const succeed = check(res, {
        "GetConsentRequestLogout - status code is 200": (r) =>
            r.status === 200,
        "GetConsentRequestLogout - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res;
    }

    return res;
}
