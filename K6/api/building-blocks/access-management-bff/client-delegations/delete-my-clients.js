import { check } from "k6";

import { DeleteMyClientsQuery } from "../../../../clients/access-management-bff/client-delegations/client-delegations.types.js";
import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { DelegationBatchInputDto } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Revokes access packages the authenticated party holds on one of its clients.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {DeleteMyClientsQuery|null} [queryParams] Optional query parameters.
 * Use {@link DeleteMyClientsQueryBuilder}.
 * @param {DelegationBatchInputDto|null} [body] Roles and access packages to
 * revoke. Use {@link DelegationBatchInputDtoBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the access was revoked.
 */
export function DeleteMyClients(
    clientDelegationsClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.DeleteMyClients(
            queryParams,
            body,
            labels,
        ),
        "DeleteMyClients",
    );

    let revoked = false;

    const succeed = check(res, {
        "DeleteMyClients - status code is 200": (r) =>
            r.status === 200,
        "DeleteMyClients - status text is 200 OK": (r) =>
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
