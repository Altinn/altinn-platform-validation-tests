import { check } from "k6";

import { DeleteMyClientProvidersQuery } from "../../../../clients/access-management-bff/client-delegations/client-delegations.types.js";
import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes a client provider from the authenticated party.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {DeleteMyClientProvidersQuery|null} [queryParams] Optional query
 * parameters. Use {@link DeleteMyClientProvidersQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the client provider was removed.
 */
export function DeleteMyClientProviders(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.DeleteMyClientProviders(
            queryParams,
            labels,
        ),
        "DeleteMyClientProviders",
    );

    let removed = false;

    const succeed = check(res, {
        "DeleteMyClientProviders - status code is 200": (r) =>
            r.status === 200,
        "DeleteMyClientProviders - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return removed;
    }

    removed = true;

    return removed;
}
