import { check } from "k6";

import { ClientDelegationsClient } from "../../../../../clients/access-management-bff/client-delegations/index.js";

/**
 * Gets the access packages delegated to an agent, per client.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {GetAgentAccessPackagesQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetAgentAccessPackagesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<ClientDelegation>|null} Clients with the access packages the
 * agent holds on them.
 */
export function GetAgentAccessPackages(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = clientDelegationsClient.GetAgentAccessPackages(
        queryParams,
        labels,
    );

    /** @type {Array<ClientDelegation>|null} */
    let clientDelegations = null;

    const succeed = check(res, {
        "GetAgentAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "GetAgentAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return clientDelegations;
    }

    check(res, {
        "GetAgentAccessPackages - body is valid": (r) => {
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
