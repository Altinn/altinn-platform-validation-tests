import { check } from "k6";

import { LogoutRedirectClient } from "../../../../clients/access-management-bff/logout-redirect/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the logout redirect target.
 *
 * @param {LogoutRedirectClient} logoutRedirectClient Client for the logout
 * redirect endpoints.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {import("k6/http").RefinedResponse<"text">} The raw response, holding the redirect
 * target.
 */
export function GetLogoutRedirect(logoutRedirectClient, labels = null) {
    const res = withRetries(
        () => logoutRedirectClient.GetLogoutRedirect(labels),
        "GetLogoutRedirect",
    );

    const succeed = check(res, {
        "GetLogoutRedirect - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res;
    }

    return res;
}
