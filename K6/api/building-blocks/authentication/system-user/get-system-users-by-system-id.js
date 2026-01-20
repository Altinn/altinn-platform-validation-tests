import { check } from "k6";
import { SystemUserApiClient } from "../../../../clients/authentication/index.js";

/**
 * Get SystemUsers for a given systemId (vendor endpoint).
 * @param {SystemUserApiClient} systemUserApiClient A client to interact with the System User API
 * @param {string} systemId
 * @returns {Object} Parsed JSON response
 */
export function GetSystemUsersBySystemId(systemUserApiClient, systemId) {
    const res = systemUserApiClient.GetSystemUsersBySystemIdForVendor(systemId);

    check(res, {
        "GetSystemUsersBySystemId - status code is 200": (r) => r.status === 200,
        "GetSystemUsersBySystemId - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetSystemUsersBySystemId - body is not empty": (r) => r.body !== null && r.body !== undefined,
        "GetSystemUsersBySystemId - body has data array": (r) => r.body && Array.isArray(JSON.parse(r.body).data),
        "GetSystemUsersBySystemId - body has links object": (r) => r.body && JSON.parse(r.body).links !== undefined,
    });

    return JSON.parse(res.body);
}

