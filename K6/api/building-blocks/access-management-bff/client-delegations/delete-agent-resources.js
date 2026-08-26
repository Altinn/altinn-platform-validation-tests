import { check } from "k6";

import { DeleteAgentResourcesQuery } from "../../../../clients/access-management-bff/client-delegations/client-delegations.types.js";
import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { ResourceDelegationBatchInputDto } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Revokes resources on a client from an agent.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {DeleteAgentResourcesQuery|null} [queryParams] Optional query
 * parameters. Use {@link DeleteAgentResourcesQueryBuilder}.
 * @param {ResourceDelegationBatchInputDto|null} [body] Roles and resources to
 * revoke. Use {@link ResourceDelegationBatchInputDtoBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the resources were revoked.
 */
export function DeleteAgentResources(
    clientDelegationsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.DeleteAgentResources(
            queryParams,
            body,
            labels,
        ),
        "DeleteAgentResources",
    );

    let revoked = false;

    const succeed = check(res, {
        "DeleteAgentResources - status code is 200": (r) =>
            r.status === 200,
        "DeleteAgentResources - status text is 200 OK": (r) =>
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
