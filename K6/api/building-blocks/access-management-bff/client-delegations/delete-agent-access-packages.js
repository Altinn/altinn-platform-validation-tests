import { check } from "k6";

import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";

/**
 * Revokes access packages on a client from an agent.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {DeleteAgentAccessPackagesQuery|null} [queryParams] Optional query
 * parameters. Use {@link DeleteAgentAccessPackagesQueryBuilder}.
 * @param {DelegationBatchInputDto|null} [body] Roles and access packages to
 * revoke. Use {@link DelegationBatchInputDtoBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the access packages were revoked.
 */
export function DeleteAgentAccessPackages(
    clientDelegationsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = clientDelegationsClient.DeleteAgentAccessPackages(
        queryParams,
        body,
        labels,
    );

    let revoked = false;

    const succeed = check(res, {
        "DeleteAgentAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "DeleteAgentAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return revoked;
    }

    revoked = true;

    return revoked;
}
