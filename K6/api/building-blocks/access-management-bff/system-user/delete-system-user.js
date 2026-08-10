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

    // The api answers 202 Accepted with an empty body, not the 200 the swagger
    // documents, so both count as deleted.
    const succeed = check(res, {
        "DeleteSystemUser - status code is 200 or 202": (r) =>
            r.status === 200 || r.status === 202,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return deleted;
    }

    deleted = true;

    return deleted;
}
