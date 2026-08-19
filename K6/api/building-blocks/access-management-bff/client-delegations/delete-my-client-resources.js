import { check } from "k6";

import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Revokes resources the authenticated party holds on one of its clients.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {DeleteMyClientResourcesQuery|null} [queryParams] Optional query
 * parameters. Use {@link DeleteMyClientResourcesQueryBuilder}.
 * @param {ResourceDelegationBatchInputDto|null} [body] Roles and resources to
 * revoke. Use {@link ResourceDelegationBatchInputDtoBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the resources were revoked.
 */
export function DeleteMyClientResources(
    clientDelegationsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.DeleteMyClientResources(
            queryParams,
            body,
            labels,
        ),
        "DeleteMyClientResources",
    );

    let revoked = false;

    const succeed = check(res, {
        "DeleteMyClientResources - status code is 200": (r) =>
            r.status === 200,
        "DeleteMyClientResources - status text is 200 OK": (r) =>
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
