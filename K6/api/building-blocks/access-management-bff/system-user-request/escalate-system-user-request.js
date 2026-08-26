import { check } from "k6";

import { SystemUserRequestClient } from "../../../../clients/access-management-bff/system-user-request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Escalates a system user request to someone who can approve it.
 *
 * @param {SystemUserRequestClient} systemUserRequestClient Client for the
 * system user request endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} requestId System user request UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the request was escalated.
 */
export function EscalateSystemUserRequest(
    systemUserRequestClient,
    partyId,
    requestId,
    labels = null,
) {
    const res = withRetries(
        () => systemUserRequestClient.EscalateSystemUserRequest(
            partyId,
            requestId,
            labels,
        ),
        "EscalateSystemUserRequest",
    );

    let escalated = false;

    const succeed = check(res, {
        "EscalateSystemUserRequest - status code is 200": (r) =>
            r.status === 200,
        "EscalateSystemUserRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return escalated;
    }

    escalated = true;

    return escalated;
}
