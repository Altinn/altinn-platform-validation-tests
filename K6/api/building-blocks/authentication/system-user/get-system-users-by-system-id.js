import { check } from "k6";
import { SystemUserApiClient } from "../../../../clients/authentication/index.js";
import { CheckAndVerifyResponse } from "../system-user-request/system-user-request-helper.js";

/**
 * Get SystemUsers for a given systemId (vendor endpoint).
 * @param {SystemUserApiClient} systemUserApiClient A client to interact with the System User API
 * @param {string} systemId
 * @returns {Object} Parsed JSON response
 */
export function GetSystemUsersBySystemId(systemUserApiClient, systemId) {
    const res = systemUserApiClient.GetSystemUsersBySystemIdForVendor(systemId);
    const succeed = CheckAndVerifyResponse(res);
    if (!succeed) return null;
    return JSON.parse(res.body);
}

