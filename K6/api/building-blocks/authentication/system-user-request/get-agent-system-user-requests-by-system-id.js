import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { CheckAndVerifyResponse } from "./system-user-request-helper.js";

/**
 * Get agent SystemUserRequests for a given systemId (vendor endpoint).
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string} systemId
 * @returns {Object} Parsed JSON response
 */
export function GetAgentSystemUserRequestsBySystemId(systemUserRequestApiClient, systemId) {
    const res = systemUserRequestApiClient.GetAgentSystemUserRequestsBySystemIdForVendor(systemId);
    CheckAndVerifyResponse(res);
    return res.json();
}

