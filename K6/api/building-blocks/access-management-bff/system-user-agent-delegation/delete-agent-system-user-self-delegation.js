import { check } from "k6";

import { SystemUserAgentDelegationClient } from "../../../../clients/access-management-bff/system-user-agent-delegation/index.js";
import { DeleteAgentSystemUserSelfDelegationQuery } from "../../../../clients/access-management-bff/system-user-agent-delegation/system-user-agent-delegation.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Revokes the delegation of the organisation itself to an agent system user.
 *
 * @param {SystemUserAgentDelegationClient} systemUserAgentDelegationClient
 * Client for the agent system user delegation endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {DeleteAgentSystemUserSelfDelegationQuery|null} [queryParams]
 * Optional query parameters. Use
 * {@link DeleteAgentSystemUserSelfDelegationQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the delegation was revoked.
 */
export function DeleteAgentSystemUserSelfDelegation(
    systemUserAgentDelegationClient,
    partyId,
    systemUserGuid,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserAgentDelegationClient.DeleteAgentSystemUserSelfDelegation(
            partyId,
            systemUserGuid,
            queryParams,
            labels,
        ),
        "DeleteAgentSystemUserSelfDelegation",
    );

    let revoked = false;

    const succeed = check(res, {
        "DeleteAgentSystemUserSelfDelegation - status code is 200": (r) =>
            r.status === 200,
        "DeleteAgentSystemUserSelfDelegation - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return revoked;
    }

    revoked = true;

    return revoked;
}
