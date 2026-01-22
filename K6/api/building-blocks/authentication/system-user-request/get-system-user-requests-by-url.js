import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";
import { CheckAndVerifyResponse } from "./system-user-request-helper.js";

/**
 * Follow pagination by next url using a fully qualified URL from links.next.
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string} url Fully qualified URL from the API response (links.next)
 * @returns {Object} Parsed JSON response
 */"";
export function GetByNextUrl(systemUserRequestApiClient, url) {
    const res = systemUserRequestApiClient.GetSystemUserRequestsByUrl(url);
    const succeed = CheckAndVerifyResponse(res);
    if (!succeed) return null;
    return JSON.parse(res.body);
}



