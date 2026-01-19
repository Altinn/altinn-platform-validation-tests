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
    const resBody = res.json();
    console.log(`[PRINT_RESPONSES] GET /systemuser/vendor/bysystem/${systemId} -> status=${res.status}`);
    console.log(JSON.stringify(resBody));

    const succeed = check(res, {
        "GetSystemUsersBySystemId - status code is 200": (r) => r.status === 200,
        "GetSystemUsersBySystemId - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetSystemUsersBySystemId - body is not empty": () => resBody !== null && resBody !== undefined,
        "GetSystemUsersBySystemId - body has data array": () => resBody && Array.isArray(resBody.data),
        "GetSystemUsersBySystemId - body has links object": () => resBody && resBody.links !== undefined,
    });

    if (!succeed) {
        console.log("Response status:", res.status);
        console.log("Response body:", res.body);
    }

    return resBody;
}

