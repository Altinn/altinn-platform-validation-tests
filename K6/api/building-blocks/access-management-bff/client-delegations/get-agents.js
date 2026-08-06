import { check } from "k6";

import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";

/**
 * Gets the agents of a party.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {GetAgentsQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetAgentsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<AgentDelegation>|null} The agents of the party.
 */
export function GetAgents(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = clientDelegationsClient.GetAgents(queryParams, labels);

    /** @type {Array<AgentDelegation>|null} */
    let agents = null;

    const succeed = check(res, {
        "GetAgents - status code is 200": (r) =>
            r.status === 200,
        "GetAgents - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return agents;
    }

    check(res, {
        "GetAgents - body is valid": (r) => {
            try {
                agents = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return agents;
}
