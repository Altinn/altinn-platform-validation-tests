import { check } from "k6";

import { SystemUserAgentDelegationClient } from "../../../../clients/access-management-bff/system-user-agent-delegation/index.js";
import { CreateAgentSystemUserSelfDelegationQuery } from "../../../../clients/access-management-bff/system-user-agent-delegation/system-user-agent-delegation.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Delegates the organisation itself to an agent system user.
 *
 * @param {SystemUserAgentDelegationClient} systemUserAgentDelegationClient
 * Client for the agent system user delegation endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {CreateAgentSystemUserSelfDelegationQuery|null} [queryParams]
 * Optional query parameters. Use
 * {@link CreateAgentSystemUserSelfDelegationQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The created delegation. The API does not publish a
 * schema for this response.
 */
export function CreateAgentSystemUserSelfDelegation(
    systemUserAgentDelegationClient,
    partyId,
    systemUserGuid,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserAgentDelegationClient.CreateAgentSystemUserSelfDelegation(
            partyId,
            systemUserGuid,
            queryParams,
            labels,
        ),
        "CreateAgentSystemUserSelfDelegation",
    );

    /** @type {any} */
    let delegation = null;

    const succeed = check(res, {
        "CreateAgentSystemUserSelfDelegation - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegation;
    }

    check(res, {
        "CreateAgentSystemUserSelfDelegation - body is valid": (r) => {
            try {
                delegation = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegation;
}
