import { check } from "k6";

import { ClientDelegationsClient } from "../../../../clients/access-management-bff/client-delegations/index.js";

/**
 * Removes an agent from a party.
 *
 * @param {ClientDelegationsClient} clientDelegationsClient Client for the
 * client delegation endpoints.
 * @param {DeleteAgentQuery|null} [queryParams] Optional query parameters. Use
 * {@link DeleteAgentQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the agent was removed.
 */
export function DeleteAgent(
    clientDelegationsClient,
    queryParams = null,
    labels = null,
) {
    const res = clientDelegationsClient.DeleteAgent(queryParams, labels);

    let removed = false;

    const succeed = check(res, {
        "DeleteAgent - status code is 200": (r) =>
            r.status === 200,
        "DeleteAgent - status text is 200 OK": (r) =>
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
