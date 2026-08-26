import { check } from "k6";

import { SystemUserChangeRequestClient } from "../../../../clients/access-management-bff/system-user-change-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the logout redirect for a system user change request.
 *
 * @param {SystemUserChangeRequestClient} systemUserChangeRequestClient Client
 * for the system user change request endpoints.
 * @param {string} changeRequestId Change request UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {import("k6/http").RefinedResponse<"text">} The raw response, holding the redirect
 * target.
 */
export function GetChangeRequestLogout(
    systemUserChangeRequestClient,
    changeRequestId,
    labels = null,
) {
    const res = withRetries(
        () => systemUserChangeRequestClient.GetChangeRequestLogout(
            changeRequestId,
            labels,
        ),
        "GetChangeRequestLogout",
    );

    const succeed = check(res, {
        "GetChangeRequestLogout - status code is 200": (r) =>
            r.status === 200,
        "GetChangeRequestLogout - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res;
    }

    return res;
}
