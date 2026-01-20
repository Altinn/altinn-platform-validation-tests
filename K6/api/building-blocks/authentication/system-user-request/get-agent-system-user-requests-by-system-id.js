import { check } from "k6";
import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";

/**
 * Get agent SystemUserRequests for a given systemId (vendor endpoint).
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string} systemId
 * @returns {Object} Parsed JSON response
 */
export function GetAgentSystemUserRequestsBySystemId(systemUserRequestApiClient, systemId) {
    const res = systemUserRequestApiClient.GetAgentSystemUserRequestsBySystemIdForVendor(systemId);
    const resBody = res.json();

    check(res, {
        "GetAgentSystemUserRequestsBySystemId - status code is 200": (r) => r.status === 200,
        "GetAgentSystemUserRequestsBySystemId - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetAgentSystemUserRequestsBySystemId - body is not empty": () => resBody !== null && resBody !== undefined,
        "GetAgentSystemUserRequestsBySystemId - body has data array": () => resBody && Array.isArray(resBody.data),
        "GetAgentSystemUserRequestsBySystemId - body has links object": () => resBody && resBody.links !== undefined,
    });

    return resBody;
}

