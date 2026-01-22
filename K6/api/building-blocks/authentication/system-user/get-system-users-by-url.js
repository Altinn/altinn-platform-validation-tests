import { SystemUserApiClient } from "../../../../clients/authentication/index.js";
import { CheckAndVerifyResponse } from "../system-user-request/system-user-request-helper.js";

/**
 * Follow pagination for SystemUsers using a fully qualified URL from links.next.
 * @param {SystemUserApiClient} systemUserApiClient A client to interact with the System User API
 * @param {string} url Fully qualified URL from the API response (links.next)
 * @returns {Object} Parsed JSON response
 */
export function GetSystemUsersByUrl(systemUserApiClient, url) {
    const res = systemUserApiClient.GetSystemUsersByNextUrl(url);
    const succeed = CheckAndVerifyResponse(res);
    if (!succeed) return null;
    return JSON.parse(res.body);
}

