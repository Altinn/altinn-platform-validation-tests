
import { check } from "k6";

import { SystemUserClient } from "../../../../clients/system-user/index.js";

/**
 * Updates an existing SystemUser.
 *
 * @param {SystemUserClient} systemUserClient Client for the SystemUser API.
 * @param {SystemUserUpdateDto} request Update payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether update succeeded.
 */
export function SystemUserUpdate(
    systemUserClient,
    request,
    labels = null,
) {
    const res = systemUserClient.SystemUserUpdate(
        request,
        labels,
    );

    return check(res, {
        "SystemUserUpdate - status code is 200": (r) =>
            r.status === 200,
        "SystemUserUpdate - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });
}
