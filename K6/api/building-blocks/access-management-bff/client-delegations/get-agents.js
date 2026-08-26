import { check } from "k6";

import { GetAgentsQuery } from "../../../../clients/access-management-bff/client-delegations/client-delegations.types.js";
import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { AgentDelegation } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the agents of a party.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {GetAgentsQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetAgentsQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<AgentDelegation>|null} The agents of the party.
 */
export function GetAgents(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.GetAgents(queryParams, labels),
        "GetAgents",
    );

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
