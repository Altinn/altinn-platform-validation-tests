import { check } from "k6";

import { SystemUserChangeRequestClient } from "../../../../clients/access-management-bff/system-user-change-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Approves a system user change request.
 *
 * @param {SystemUserChangeRequestClient} systemUserChangeRequestClient Client
 * for the system user change request endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} changeRequestId Change request UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the change request was approved.
 */
export function ApproveChangeRequest(
    systemUserChangeRequestClient,
    partyId,
    changeRequestId,
    labels = null,
) {
    const res = withRetries(
        () =>
            systemUserChangeRequestClient.ApproveChangeRequest(
                partyId,
                changeRequestId,
                labels,
            ),
        "ApproveChangeRequest",
    );

    let approved = false;

    const succeed = check(res, {
        "ApproveChangeRequest - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return approved;
    }

    approved = true;

    return approved;
}
