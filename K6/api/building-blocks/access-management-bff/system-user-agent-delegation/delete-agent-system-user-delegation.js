import { check } from "k6";

import { SystemUserAgentDelegationClient } from "../../../../clients/access-management-bff/system-user-agent-delegation/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Revokes a customer delegated to an agent system user.
 *
 * @param {SystemUserAgentDelegationClient} systemUserAgentDelegationClient
 * Client for the agent system user delegation endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {string} delegationId Delegation UUID.
 * @param {DeleteAgentSystemUserDelegationQuery|null} [queryParams] Optional
 * query parameters. Use {@link DeleteAgentSystemUserDelegationQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the delegation was revoked.
 */
export function DeleteAgentSystemUserDelegation(
    systemUserAgentDelegationClient,
    partyId,
    systemUserGuid,
    delegationId,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserAgentDelegationClient.DeleteAgentSystemUserDelegation(
            partyId,
            systemUserGuid,
            delegationId,
            queryParams,
            labels,
        ),
        "DeleteAgentSystemUserDelegation",
    );

    let revoked = false;

    const succeed = check(res, {
        "DeleteAgentSystemUserDelegation - status code is 200": (r) =>
            r.status === 200,
        "DeleteAgentSystemUserDelegation - status text is 200 OK": (r) =>
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
