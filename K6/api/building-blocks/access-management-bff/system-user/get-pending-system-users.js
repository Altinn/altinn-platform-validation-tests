import { check } from "k6";

import { SystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the pending system user requests of an organisation.
 *
 * @param {SystemUserClient} systemUserClient Client for the system user
 * endpoints.
 * @param {string} partyUuid Party UUID of the organisation.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The pending system users. The API does not publish a
 * schema for this response.
 */
export function GetPendingSystemUsers(
    systemUserClient,
    partyUuid,
    labels = null,
) {
    const res = withRetries(
        () => systemUserClient.GetPendingSystemUsers(partyUuid, labels),
        "GetPendingSystemUsers",
    );

    /** @type {object|null} */
    let pendingSystemUsers = null;

    const succeed = check(res, {
        "GetPendingSystemUsers - status code is 200": (r) =>
            r.status === 200,
        "GetPendingSystemUsers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return pendingSystemUsers;
    }

    check(res, {
        "GetPendingSystemUsers - body is valid": (r) => {
            try {
                pendingSystemUsers = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return pendingSystemUsers;
}
