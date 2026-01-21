import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { CheckAndVerifyResponse } from "./system-user-request-helper.js";

/**
 * Get SystemUserRequests for a given systemId (vendor endpoint).
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string} systemId
 * @returns {Object} Parsed JSON response
 */
export function GetSystemUserRequestsBySystemId(systemUserRequestApiClient, systemId) {
    const res = systemUserRequestApiClient.GetSystemUserRequestsBySystemIdForVendor(systemId);
    const succeed = CheckAndVerifyResponse(res);
    if (!succeed) return null;
    return res.json();
}

