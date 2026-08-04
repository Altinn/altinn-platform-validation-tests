import { check } from "k6";

import { SystemUserChangeRequestClient } from "../../../../clients/access-management-bff/system-user-change-request/index.js";

/**
 * Rejects a system user change request.
 *
 * @param {SystemUserChangeRequestClient} systemUserChangeRequestClient Client
 * for the system user change request endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} changeRequestId Change request UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the change request was rejected.
 */
export function RejectChangeRequest(
    systemUserChangeRequestClient,
    partyId,
    changeRequestId,
    labels = null,
) {
    const res = systemUserChangeRequestClient.RejectSystemUserChangeRequest(
        partyId,
        changeRequestId,
        labels,
    );

    let rejected = false;

    const succeed = check(res, {
        "RejectChangeRequest - status code is 200": (r) =>
            r.status === 200,
        "RejectChangeRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rejected;
    }

    rejected = true;

    return rejected;
}
