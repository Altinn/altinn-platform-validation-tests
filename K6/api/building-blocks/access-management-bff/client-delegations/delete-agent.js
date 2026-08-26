import { check } from "k6";

import { DeleteAgentQuery } from "../../../../clients/access-management-bff/client-delegations/client-delegations.types.js";
import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes an agent from a party.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {DeleteAgentQuery|null} [queryParams] Optional query parameters. Use
 * {@link DeleteAgentQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the agent was removed.
 */
export function DeleteAgent(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationsClient.DeleteAgent(queryParams, labels),
        "DeleteAgent",
    );

    let removed = false;

    const succeed = check(res, {
        "DeleteAgent - status code is 204": (r) =>
            r.status === 204,
        "DeleteAgent - status text is 204 No Content": (r) =>
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
