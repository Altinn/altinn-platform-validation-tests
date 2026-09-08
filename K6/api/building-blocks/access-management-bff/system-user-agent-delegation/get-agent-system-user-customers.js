import { check } from "k6";

import { SystemUserAgentDelegationClient } from "../../../../clients/access-management-bff/system-user-agent-delegation/index.js";
import { GetAgentSystemUserCustomersQuery } from "../../../../clients/access-management-bff/system-user-agent-delegation/system-user-agent-delegation.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the customers an agent system user can be delegated.
 *
 * @param {SystemUserAgentDelegationClient} systemUserAgentDelegationClient
 * Client for the agent system user delegation endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {GetAgentSystemUserCustomersQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetAgentSystemUserCustomersQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {any} The customers. The API does not publish a schema for
 * this response.
 */
export function GetAgentSystemUserCustomers(
    systemUserAgentDelegationClient,
    partyId,
    systemUserGuid,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => systemUserAgentDelegationClient.GetAgentSystemUserCustomers(
            partyId,
            systemUserGuid,
            queryParams,
            labels,
        ),
        "GetAgentSystemUserCustomers",
    );

    /** @type {any} */
    let customers = null;

    const succeed = check(res, {
        "GetAgentSystemUserCustomers - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return customers;
    }

    check(res, {
        "GetAgentSystemUserCustomers - body is valid": (r) => {
            try {
                customers = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return customers;
}
