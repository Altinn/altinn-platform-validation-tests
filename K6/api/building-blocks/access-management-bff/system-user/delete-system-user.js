import { check } from "k6";

import { SystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";

/**
 * Deletes a system user of an organisation.
 *
 * @param {SystemUserClient} systemUserClient Client for the system user
 * endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the system user was deleted.
 */
export function DeleteSystemUser(
    systemUserClient,
    partyId,
    systemUserGuid,
    labels = null,
) {
    const res = systemUserClient.DeleteSystemUser(
        partyId,
        systemUserGuid,
        labels,
    );

    let deleted = false;

    const succeed = check(res, {
        "DeleteSystemUser - status code is 200": (r) =>
            r.status === 200,
        "DeleteSystemUser - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return deleted;
    }

    deleted = true;

    return deleted;
}
