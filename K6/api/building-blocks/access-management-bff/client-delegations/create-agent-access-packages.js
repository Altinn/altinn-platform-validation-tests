import { check } from "k6";

import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";

/**
 * Delegates access packages on a client to an agent.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {CreateAgentAccessPackagesQuery|null} [queryParams] Optional query
 * parameters. Use {@link CreateAgentAccessPackagesQueryBuilder}.
 * @param {DelegationBatchInputDto|null} [body] Roles and access packages to
 * delegate. Use {@link DelegationBatchInputDtoBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<DelegationDto>|null} The resulting delegations.
 */
export function CreateAgentAccessPackages(
    clientDelegationsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = clientDelegationsClient.CreateAgentAccessPackages(
        queryParams,
        body,
        labels,
    );

    /** @type {Array<DelegationDto>|null} */
    let delegations = null;

    const succeed = check(res, {
        "CreateAgentAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "CreateAgentAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "CreateAgentAccessPackages - body is valid": (r) => {
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
