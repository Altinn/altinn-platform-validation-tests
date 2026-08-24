import { check } from "k6";

import { SystemUserRequestClient } from "../../../../clients/access-management-bff/system-user-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Approves a system user request.
 *
 * @param {SystemUserRequestClient} systemUserRequestClient Client for the
 * system user request endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} requestId System user request UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the request was approved.
 */
export function ApproveSystemUserRequest(
    systemUserRequestClient,
    partyId,
    requestId,
    labels = null,
) {
    const res = withRetries(
        () =>
            systemUserRequestClient.ApproveSystemUserRequest(
                partyId,
                requestId,
                labels,
            ),
        "ApproveSystemUserRequest",
    );

    let approved = false;

    const succeed = check(res, {
        "ApproveSystemUserRequest - status code is 200": (r) =>
            r.status === 200,
        "ApproveSystemUserRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return approved;
    }

    approved = true;

    return approved;
}
