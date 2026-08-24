import { check } from "k6";

import { DeleteMyClientProviderQuery } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Removes a client provider from the authenticated party.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {DeleteMyClientProviderQuery} queryParams
 * Query parameters. Use {@link DeleteMyClientProviderQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the client provider was successfully removed.
 */
export function DeleteMyClientProvider(
    clientDelegationClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.DeleteMyClientProvider(
            queryParams,
            labels,
        ),
        "DeleteMyClientProvider",
    );

    let removed = false;

    const succeed = check(res, {
        "DeleteMyClientProvider - status code is 204": (r) =>
            r.status === 204,
        "DeleteMyClientProvider - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return removed;
    }

    removed = true;

    return removed;
}
