import { SystemUserApiClient } from "../../../../clients/authentication/index.js";
import { check } from "k6";

/**
 * Get SystemUsers for a given systemId (vendor endpoint).
 * @param {SystemUserApiClient} systemUserApiClient A client to interact with the System User API
 * @param {string} systemId
 * @returns {string | null} Raw JSON response body
 */
export function GetSystemUsersBySystemId(systemUserApiClient, systemId) {
    const res = systemUserApiClient.GetSystemUsersBySystemIdForVendor(systemId);
    check(res, {
        "status is 200": (r) => r.status === 200,
        "status text is 200 OK": (r) => r.status_text === "200 OK",
    });
    return res.body;
}
