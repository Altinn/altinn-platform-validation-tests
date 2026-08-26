import { check } from "k6";

import { SystemUserRequestClient } from "../../../../clients/access-management-bff/system-user-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the logout redirect for a system user request.
 *
 * @param {SystemUserRequestClient} systemUserRequestClient Client for the
 * system user request endpoints.
 * @param {string} requestId System user request UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {import("k6/http").RefinedResponse<"text">} The raw response, holding the redirect
 * target.
 */
export function GetSystemUserRequestLogout(
    systemUserRequestClient,
    requestId,
    labels = null,
) {
    const res = withRetries(
        () => systemUserRequestClient.GetSystemUserRequestLogout(
            requestId,
            labels,
        ),
        "GetSystemUserRequestLogout",
    );

    const succeed = check(res, {
        "GetSystemUserRequestLogout - status code is 200": (r) =>
            r.status === 200,
        "GetSystemUserRequestLogout - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res;
    }

    return res;
}
