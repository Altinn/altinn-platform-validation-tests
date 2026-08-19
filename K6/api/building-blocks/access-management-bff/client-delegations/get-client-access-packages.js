import { check } from "k6";

import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the agents holding access packages on a client.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {GetClientAccessPackagesQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetClientAccessPackagesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<AgentDelegation>|null} Agents with the access packages they
 * hold on the client.
 */
export function GetClientAccessPackages(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.GetClientAccessPackages(
            queryParams,
            labels,
        ),
        "GetClientAccessPackages",
    );

    /** @type {Array<AgentDelegation>|null} */
    let agentDelegations = null;

    const succeed = check(res, {
        "GetClientAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "GetClientAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return agentDelegations;
    }

    check(res, {
        "GetClientAccessPackages - body is valid": (r) => {
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
