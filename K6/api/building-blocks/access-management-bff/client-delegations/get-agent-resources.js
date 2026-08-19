import { check } from "k6";

import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the resources delegated to an agent, per client.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {GetAgentResourcesQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetAgentResourcesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<ClientDelegation>|null} Clients with the resources the agent
 * holds on them.
 */
export function GetAgentResources(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.GetAgentResources(queryParams, labels),
        "GetAgentResources",
    );

    /** @type {Array<ClientDelegation>|null} */
    let clientDelegations = null;

    const succeed = check(res, {
        "GetAgentResources - status code is 200": (r) =>
            r.status === 200,
        "GetAgentResources - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return clientDelegations;
    }

    check(res, {
        "GetAgentResources - body is valid": (r) => {
            try {
                clientDelegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return clientDelegations;
}
