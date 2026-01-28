import { SystemUserApiClient } from "../../../../clients/authentication/index.js";
import { check } from "k6";

/**
 * Follow pagination for SystemUsers using a fully qualified URL from links.next.
 * @param {SystemUserApiClient} systemUserApiClient A client to interact with the System User API
 * @param {string} url Fully qualified URL from the API response (links.next)
 * @returns {string | null} Raw JSON response body
 */
export function GetSystemUsersByUrl(systemUserApiClient, url) {
    const res = systemUserApiClient.GetSystemUsersByNextUrl(url);
    check(res, {
        "status is 200": (r) => r.status === 200,
        "status text is 200 OK": (r) => r.status_text === "200 OK",
    });
    return res.body;
}
