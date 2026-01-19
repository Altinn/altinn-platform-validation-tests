import { check } from "k6";
import { SystemUserRequestApiClient } from "../../../../clients/authentication/index.js";

/**
 * Follow pagination for SystemUserRequests using a fully qualified URL from links.next.
 * @param {SystemUserRequestApiClient} systemUserRequestApiClient A client to interact with the System User Request API
 * @param {string} url Fully qualified URL from the API response (links.next)
 * @returns {Object} Parsed JSON response
 */
export function GetSystemUserRequestsByUrl(systemUserRequestApiClient, url) {
    const res = systemUserRequestApiClient.GetSystemUserRequestsByUrl(url);
    const resBody = res.json();

    check(res, {
        "GetSystemUserRequestsByUrl - status code is 200": (r) => r.status === 200,
        "GetSystemUserRequestsByUrl - status text is 200 OK": (r) => r.status_text == "200 OK",
        "GetSystemUserRequestsByUrl - body is not empty": () => resBody !== null && resBody !== undefined,
        "GetSystemUserRequestsByUrl - body has data array": () => resBody && Array.isArray(resBody.data),
    });

    return resBody;
}

