import { check } from "k6";

import { SystemUserClient } from "../../../../clients/access-management-bff/system-user/index.js";
import { DeleteAgentSystemUserQuery } from "../../../../clients/access-management-bff/system-user/system-user.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes an agent system user of an organisation.
 *
 * @param {SystemUserClient} systemUserClient Client for the system user
 * endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {DeleteAgentSystemUserQuery|null} [queryParams] Optional query
 * parameters. Use {@link DeleteAgentSystemUserQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the agent system user was deleted.
 */
export function DeleteAgentSystemUser(
    systemUserClient,
    partyId,
    systemUserGuid,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserClient.DeleteAgentSystemUser(
            partyId,
            systemUserGuid,
            queryParams,
            labels,
        ),
        "DeleteAgentSystemUser",
    );

    let deleted = false;

    const succeed = check(res, {
        "DeleteAgentSystemUser - status code is 202": (r) =>
            r.status === 202,
        "DeleteAgentSystemUser - status text is 202 Accepted": (r) =>
            r.status_text === "202 Accepted",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return deleted;
    }

    deleted = true;

    return deleted;
}
