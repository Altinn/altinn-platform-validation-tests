import { check } from "k6";

import { SystemUserAgentDelegationClient } from "../../../../clients/access-management-bff/system-user-agent-delegation/index.js";
import { GetAgentSystemUserDelegationsQuery } from "../../../../clients/access-management-bff/system-user-agent-delegation/system-user-agent-delegation.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the customers delegated to an agent system user.
 *
 * @param {SystemUserAgentDelegationClient} systemUserAgentDelegationClient
 * Client for the agent system user delegation endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {GetAgentSystemUserDelegationsQuery|null} [queryParams] Optional
 * query parameters. Use {@link GetAgentSystemUserDelegationsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {any} The delegations. The API does not publish a schema
 * for this response.
 */
export function GetAgentSystemUserDelegations(
    systemUserAgentDelegationClient,
    partyId,
    systemUserGuid,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserAgentDelegationClient.GetAgentSystemUserDelegations(
            partyId,
            systemUserGuid,
            queryParams,
            labels,
        ),
        "GetAgentSystemUserDelegations",
    );

    /** @type {any} */
    let delegations = null;

    const succeed = check(res, {
        "GetAgentSystemUserDelegations - status code is 200": (r) =>
            r.status === 200,
        "GetAgentSystemUserDelegations - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "GetAgentSystemUserDelegations - body is valid": (r) => {
            try {
                delegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegations;
}
