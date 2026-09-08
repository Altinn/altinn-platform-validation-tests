import { check } from "k6";

import { DeleteMyClientsQuery } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { DelegationBatchInputDto, DelegationDto } from "../../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Revokes the authenticated party's access to a client.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {DeleteMyClientsQuery} queryParams
 * Query parameters. Use {@link DeleteMyClientsQueryBuilder}.
 * @param {DelegationBatchInputDto|null} [body]
 * Request body. Use {@link DelegationBatchInputBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<DelegationDto>} The delegations that were revoked.
 */
export function DeleteMyClients(
    clientDelegationClient,
    queryParams,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.DeleteMyClients(
            queryParams,
            body,
            labels,
        ),
        "DeleteMyClients",
    );

    /** @type {Array<DelegationDto>} */
    let delegations = [];

    const succeed = check(res, {
        "DeleteMyClients - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "DeleteMyClients - body is valid": (r) => {
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
