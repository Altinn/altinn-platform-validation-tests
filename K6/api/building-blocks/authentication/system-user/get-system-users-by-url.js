import { check } from "k6";
import { SystemUserApiClient } from "../../../../clients/authentication/index.js";

/**
 * Follow pagination for SystemUsers using a fully qualified URL from links.next.
 * @param {SystemUserApiClient} systemUserApiClient A client to interact with the System User API
 * @param {string} url Fully qualified URL from the API response (links.next)
 * @returns {Object} Parsed JSON response
 */
export function GetSystemUsersByUrl(systemUserApiClient, url) {
    const res = systemUserApiClient.GetSystemUsersByNextUrl(url);
    const resBody = res.json();
    console.log(`[PRINT_RESPONSES] GET ${url} -> status=${res.status}`);
    console.log(JSON.stringify(resBody));

    check(res, {
        "GetSystemUsersByUrl - status code is 200": (r) => r.status === 200,
        "GetSystemUsersByUrl - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetSystemUsersByUrl - body is not empty": () => resBody !== null && resBody !== undefined,
        "GetSystemUsersByUrl - body has data array": () => resBody && Array.isArray(resBody.data),
    });

    return resBody;
}

