import { check } from "k6";

import { DeleteMyClientAccessPackagesQuery } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { DelegationBatchInputDto, DelegationDto } from "../../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Revokes access packages the authenticated party holds on a client.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {DeleteMyClientAccessPackagesQuery} queryParams
 * Query parameters. Use {@link DeleteMyClientAccessPackagesQueryBuilder}.
 * @param {DelegationBatchInputDto|null} [body]
 * Request body. Use {@link DelegationBatchInputBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<DelegationDto>} The delegations that were revoked.
 */
export function DeleteMyClientAccessPackages(
    clientDelegationClient,
    queryParams,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.DeleteMyClientAccessPackages(
            queryParams,
            body,
            labels,
        ),
        "DeleteMyClientAccessPackages",
    );

    /** @type {Array<DelegationDto>} */
    let delegations = [];

    const succeed = check(res, {
        "DeleteMyClientAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "DeleteMyClientAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "DeleteMyClientAccessPackages - body is valid": (r) => {
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
