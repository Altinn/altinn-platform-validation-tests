import { check } from "k6";
import { BffAccessManagementApiClient } from "../../../../clients/authentication/index.js";

/**
 * Revoke a consent as the consenter (end user).
 * @param {BffAccessManagementApiClient} bffAccessManagementApiClient
 * @param {string} id - consent request id
 * @param {*} labels
 * @returns {string | null} Raw JSON response body
 */
export function RevokeConsent(bffAccessManagementApiClient, id, labels = null) {
    const res = bffAccessManagementApiClient.RevokeConsent(id, labels);
    const isOk = check(res, {
        "RevokeConsent - status code is 200": (r) => r.status === 200,
        "RevokeConsent - status text is 200 OK": (r) => r.status_text === "200 OK",
    });
    if (!isOk) {
        console.log(res.status, res.status_text);
        console.log(res.body);
    }
    return res.body;
}
