import { check } from "k6";

import { SystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";

/**
 * Deletes an agent system user of an organisation.
 *
 * @param {SystemUserClient} systemUserClient Client for the system user
 * endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {DeleteAgentSystemUserQuery|null} [queryParams] Optional query
 * parameters. Use {@link DeleteAgentSystemUserQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the agent system user was deleted.
 */
export function DeleteAgentSystemUser(
    systemUserClient,
    partyId,
    systemUserGuid,
    queryParams = null,
    labels = null,
) {
    const res = systemUserClient.DeleteAgentSystemUser(
        partyId,
        systemUserGuid,
        queryParams,
        labels,
    );

    let deleted = false;

    const succeed = check(res, {
        "DeleteAgentSystemUser - status code is 200": (r) =>
            r.status === 200,
        "DeleteAgentSystemUser - status text is 200 OK": (r) =>
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
