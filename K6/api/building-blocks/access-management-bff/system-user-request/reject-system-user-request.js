import { check } from "k6";

import { SystemUserRequestClient } from "../../../../clients/access-management-bff/system-user-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Rejects a system user request.
 *
 * @param {SystemUserRequestClient} systemUserRequestClient Client for the
 * system user request endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} requestId System user request UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the request was rejected.
 */
export function RejectSystemUserRequest(
    systemUserRequestClient,
    partyId,
    requestId,
    labels = null,
) {
    const res = withRetries(
        () => systemUserRequestClient.RejectSystemUserRequest(
            partyId,
            requestId,
            labels,
        ),
        "RejectSystemUserRequest",
    );

    let rejected = false;

    const succeed = check(res, {
        "RejectSystemUserRequest - status code is 200": (r) =>
            r.status === 200,
        "RejectSystemUserRequest - status text is 200 OK": (r) =>
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
