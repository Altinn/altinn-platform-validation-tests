import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { check } from "k6";

/**
 * Get SystemUserRequests for a given systemId (vendor endpoint).
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string} systemId
 * @returns {string | null} Raw JSON response body
 */
export function GetSystemUserRequestsBySystemId(
    systemUserRequestApiClient,
    systemId,
) {
    const res =
        systemUserRequestApiClient.GetSystemUserRequestsBySystemIdForVendor(
            systemId,
        );
    const ok = check(res, {
        "status is 200": (r) => r.status === 200,
    });
    if (!ok) return null;
    return res.body;
}
