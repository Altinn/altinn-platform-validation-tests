import { check } from "k6";

import { ServiceOwnerResourceDelegation } from "../../../../../clients/access-management/service-owner/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/service-owner/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Revokes a service owner resource delegation.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {ServiceOwnerResourceDelegation} request Delegation payload.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the operation succeeded.
 */
export function ConnectionsRevokeResource(
    connectionsClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.ConnectionsRevokeResource(request, labels),
        "ConnectionsRevokeResource",
    );

    const succeed = check(res, {
        "ConnectionsRevokeResource - status code is 204": (r) =>
            r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
