import { check } from "k6";
import { ConsentApiClient } from "../../../../clients/authentication/index.js";

/**
 * Approve Consent
 * @param {ConsentApiClient} consentApiClient A client to interact with the Consent API
 * @param {string } id
 * @returns (string | ArrayBuffer | null)
 */
export function ApproveConsent(consentApiClient, id) {
    const res = consentApiClient.ApproveConsent(id);
    const succeed = check(res, {
        "ApproveConsent - status code is 200": (r) => r.status === 200,
        "ApproveConsent - status text is 200 OK": (r) => r.status_text == "200 OK",
        "ApproveConsent - body is not empty": (r) => {
            const res_body = JSON.parse(r.body);
            return res_body !== null && res_body !== undefined;
        }
    });
    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }
    return res.body;
}
