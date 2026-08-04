import { check } from "k6";

import { SystemUserAgentDelegationClient } from "../../../../clients/access-management-bff/system-user-agent-delegation/index.js";

/**
 * Delegates a customer to an agent system user.
 *
 * @param {SystemUserAgentDelegationClient} systemUserAgentDelegationClient
 * Client for the agent system user delegation endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {CreateAgentSystemUserDelegationQuery|null} [queryParams] Optional
 * query parameters. Use {@link CreateAgentSystemUserDelegationQueryBuilder}.
 * @param {AgentDelegationRequestFE|null} [body] The customer and access to
 * delegate. Use {@link AgentDelegationRequestFEBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The created delegation. The API does not publish a
 * schema for this response.
 */
export function CreateAgentSystemUserDelegation(
    systemUserAgentDelegationClient,
    partyId,
    systemUserGuid,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = systemUserAgentDelegationClient.CreateAgentSystemUserDelegation(
        partyId,
        systemUserGuid,
        queryParams,
        body,
        labels,
    );

    /** @type {object|null} */
    let delegation = null;

    const succeed = check(res, {
        "CreateAgentSystemUserDelegation - status code is 200": (r) =>
            r.status === 200,
        "CreateAgentSystemUserDelegation - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegation;
    }

    check(res, {
        "CreateAgentSystemUserDelegation - body is valid": (r) => {
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
