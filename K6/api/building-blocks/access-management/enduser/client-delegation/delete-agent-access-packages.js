import { check } from "k6";

import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";

/**
 * Revokes access packages on a client from an agent.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {AgentClientAccessPackagesQuery} queryParams
 * Query parameters. Use {@link AgentClientAccessPackagesQueryBuilder}.
 * @param {DelegationBatchInputDto|null} [body]
 * Request body. Use {@link DelegationBatchInputBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<DelegationDto>} The delegations that were revoked.
 */
export function DeleteAgentAccessPackages(
    clientDelegationClient,
    queryParams,
    body = null,
    labels = null,
) {
    const res = clientDelegationClient.DeleteAgentAccessPackages(
        queryParams,
        body,
        labels,
    );

    /** @type {Array<DelegationDto>} */
    let delegations = [];

    const succeed = check(res, {
        "DeleteAgentAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "DeleteAgentAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "DeleteAgentAccessPackages - body is valid": (r) => {
            try {
                delegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegations;
}
