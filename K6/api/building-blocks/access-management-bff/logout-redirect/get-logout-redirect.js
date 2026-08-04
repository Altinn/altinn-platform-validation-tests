import { check } from "k6";

import { LogoutRedirectClient } from "../../../../clients/access-management-bff/logout-redirect/index.js";

/**
 * Gets the logout redirect target.
 *
 * @param {LogoutRedirectClient} logoutRedirectClient Client for the logout
 * redirect endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {http.RefinedResponse} The raw response, holding the redirect
 * target.
 */
export function GetLogoutRedirect(logoutRedirectClient, labels = null) {
    const res = logoutRedirectClient.GetLogoutRedirect(labels);

    const succeed = check(res, {
        "GetLogoutRedirect - status code is 200": (r) =>
            r.status === 200,
        "GetLogoutRedirect - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res;
    }

    return res;
}
