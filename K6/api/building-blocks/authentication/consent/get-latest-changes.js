import { check } from "k6";
import { ConsentApiClient } from "../../../../clients/authentication/index.js";

/**
 * Get latest consent request status changes for the authenticated organization
 * Docs {@link https://docs.altinn.studio/en/authorization/guides/system-vendor/consent/liststatuschanges/}
 * @param {ConsentApiClient} consentApiClient
 * @param {*} labels
 * @returns {string | null} Raw JSON response body
 */
export function GetLatestChanges(consentApiClient, labels = null) {
    const res = consentApiClient.GetLatestChanges(labels);
    const isOk = check(res, {
        "GetLatestChanges - status code is 200": (r) => r.status === 200,
        "GetLatestChanges - status text is 200 OK": (r) => r.status_text === "200 OK",
    });
    if (!isOk) {
        console.log(res.status, res.status_text);
        console.log(res.body);
    }
    return res.body;
}
