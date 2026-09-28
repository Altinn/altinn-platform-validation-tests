import { check } from "k6";

import { GetClientResourcesQuery } from "../../../../clients/access-management-bff/client-delegations/client-delegations.types.js";
import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { AgentDelegation } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the agents holding resources on a client.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {GetClientResourcesQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetClientResourcesQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<AgentDelegation>|null} Agents with the resources they hold
 * on the client.
 */
export function GetClientResources(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.GetClientResources(
            queryParams,
            labels,
        ),
        "GetClientResources",
    );

    /** @type {Array<AgentDelegation>|null} */
    let agentDelegations = null;

    const succeed = check(res, {
        "GetClientResources - status code is 200": (r) =>
            r.status === 200,
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
