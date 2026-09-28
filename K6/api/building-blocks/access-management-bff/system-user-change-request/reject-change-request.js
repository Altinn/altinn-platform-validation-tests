import { check } from "k6";

import { SystemUserChangeRequestClient } from "../../../../clients/access-management-bff/system-user-change-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Rejects a system user change request.
 *
 * @param {SystemUserChangeRequestClient} systemUserChangeRequestClient Client
 * for the system user change request endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} changeRequestId Change request UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the change request was rejected.
 */
export function RejectChangeRequest(
    systemUserChangeRequestClient,
    partyId,
    changeRequestId,
    labels = null,
) {
    const res = withRetries(
        () => systemUserChangeRequestClient.RejectChangeRequest(
            partyId,
            changeRequestId,
            labels,
        ),
        "RejectChangeRequest",
    );

    let rejected = false;

    const succeed = check(res, {
        "RejectChangeRequest - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rejected;
    }

    rejected = true;

    return rejected;
}
