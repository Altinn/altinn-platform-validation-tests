import { check } from "k6";

import { DeleteAgentClientsQuery } from "../../../../../clients/access-management/enduser/client-delegation/client-delegation.types.js";
import { ClientDelegationClient } from "../../../../../clients/access-management/enduser/client-delegation/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Revokes an agent's access to a client.
 *
 * @param {ClientDelegationClient} clientDelegationClient Client for the Client Delegation API.
 * @param {DeleteAgentClientsQuery} queryParams
 * Query parameters. Use {@link DeleteAgentClientsQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the access was successfully revoked.
 */
export function DeleteAgentClients(
    clientDelegationClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => clientDelegationClient.DeleteAgentClients(
            queryParams,
            labels,
        ),
        "DeleteAgentClients",
    );

    let revoked = false;

    const succeed = check(res, {
        "DeleteAgentClients - status code is 204": (r) =>
            r.status === 204,
        "DeleteAgentClients - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return revoked;
    }

    revoked = true;

    return revoked;
}
