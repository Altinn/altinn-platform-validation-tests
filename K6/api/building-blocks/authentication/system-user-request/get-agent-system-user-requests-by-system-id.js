import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { check } from "k6";

/**
 * Get agent SystemUserRequests for a given systemId (vendor endpoint).
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string} systemId
 * @returns {Object} Parsed JSON response
 */
export function GetAgentSystemUserRequestsBySystemId(
    systemUserRequestApiClient,
    systemId,
) {
    const res =
        systemUserRequestApiClient.GetAgentSystemUserRequestsBySystemIdForVendor(
            systemId,
        );
    const isOk = check(res, {
        "status is 200": (r) => r.status === 200,
        "status text is 200 OK": (r) => r.status_text === "200 OK",
    });

    if (!isOk) {
        console.log(res.status, res.status_text);
        console.log(res.body);
    }
    return res.body;
}
