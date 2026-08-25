import { check } from "k6";

import { DeleteAgentQuery } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Removes an agent from a party.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {DeleteAgentQuery} queryParams
 * Query parameters. Use {@link DeleteAgentQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the agent was successfully removed.
 */
export function DeleteAgent(
    clientDelegationClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.DeleteAgent(
            queryParams,
            labels,
        ),
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
