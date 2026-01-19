import { check } from "k6";
import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";

/**
 * Get SystemUserRequests for a given systemId (vendor endpoint).
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string} systemId
 * @returns {Object} Parsed JSON response
 */
export function GetSystemUserRequestsBySystemId(systemUserRequestApiClient, systemId) {
    const res = systemUserRequestApiClient.GetSystemUserRequestsBySystemIdForVendor(systemId);
    const resBody = res.json();

    check(res, {
        "GetSystemUserRequestsBySystemId - status code is 200": (r) => r.status === 200,
        "GetSystemUserRequestsBySystemId - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetSystemUserRequestsBySystemId - body is not empty": () => resBody !== null && resBody !== undefined,
        "GetSystemUserRequestsBySystemId - body has data array": () => resBody && Array.isArray(resBody.data),
        "GetSystemUserRequestsBySystemId - body has links object": () => resBody && resBody.links !== undefined,
    });

    return resBody;
}

