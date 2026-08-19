import { check } from "k6";

import { SystemUserAgentDelegationClient } from "../../../../clients/access-management-bff/system-user-agent-delegation/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the delegation of the organisation itself to an agent system user.
 *
 * @param {SystemUserAgentDelegationClient} systemUserAgentDelegationClient
 * Client for the agent system user delegation endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {GetAgentSystemUserSelfDelegationQuery|null} [queryParams] Optional
 * query parameters. Use {@link GetAgentSystemUserSelfDelegationQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The delegation. The API does not publish a schema for
 * this response.
 */
export function GetAgentSystemUserSelfDelegation(
    systemUserAgentDelegationClient,
    partyId,
    systemUserGuid,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserAgentDelegationClient.GetAgentSystemUserSelfDelegation(
            partyId,
            systemUserGuid,
            queryParams,
            labels,
        ),
        "GetAgentSystemUserSelfDelegation",
    );

    /** @type {object|null} */
    let delegation = null;

    const succeed = check(res, {
        "GetAgentSystemUserSelfDelegation - status code is 200": (r) =>
            r.status === 200,
        "GetAgentSystemUserSelfDelegation - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegation;
    }

    check(res, {
        "GetAgentSystemUserSelfDelegation - body is valid": (r) => {
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
