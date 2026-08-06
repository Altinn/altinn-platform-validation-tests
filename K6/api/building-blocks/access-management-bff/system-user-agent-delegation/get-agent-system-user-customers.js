import { check } from "k6";

import { SystemUserAgentDelegationClient } from "../../../../clients/access-management-bff/system-user-agent-delegation/index.js";

/**
 * Gets the customers an agent system user can be delegated.
 *
 * @param {SystemUserAgentDelegationClient} systemUserAgentDelegationClient
 * Client for the agent system user delegation endpoints.
 * @param {number} partyId Party id of the organisation.
 * @param {string} systemUserGuid System user UUID.
 * @param {GetAgentSystemUserCustomersQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetAgentSystemUserCustomersQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The customers. The API does not publish a schema for
 * this response.
 */
export function GetAgentSystemUserCustomers(
    systemUserAgentDelegationClient,
    partyId,
    systemUserGuid,
    queryParams = null,
    labels = null,
) {
    const res = systemUserAgentDelegationClient.GetAgentSystemUserCustomers(
        partyId,
        systemUserGuid,
        queryParams,
        labels,
    );

    /** @type {object|null} */
    let customers = null;

    const succeed = check(res, {
        "GetAgentSystemUserCustomers - status code is 200": (r) =>
            r.status === 200,
        "GetAgentSystemUserCustomers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
