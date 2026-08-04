import { check } from "k6";

import { ClientDelegationsClient } from "../../../../../clients/access-management-bff/client-delegations/index.js";

/**
 * Gets the agents holding resources on a client.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {GetClientResourcesQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetClientResourcesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<AgentDelegation>|null} Agents with the resources they hold
 * on the client.
 */
export function GetClientResources(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = clientDelegationsClient.GetClientResources(
        queryParams,
        labels,
    );

    /** @type {Array<AgentDelegation>|null} */
    let agentDelegations = null;

    const succeed = check(res, {
        "GetClientResources - status code is 200": (r) =>
            r.status === 200,
        "GetClientResources - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return agentDelegations;
    }

    check(res, {
        "GetClientResources - body is valid": (r) => {
            try {
                agentDelegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return agentDelegations;
}
