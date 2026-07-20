import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Revokes a service owner access package delegation.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {ServiceOwnerAccessPackageDelegation} request Delegation payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the operation succeeded.
 */
export function ConnectionsRevokeAccessPackage(
    connectionsClient,
    request,
    labels = null,
) {
    const res = connectionsClient.ConnectionsRevokeAccessPackage(
        request,
        labels,
    );

    const succeed = check(res, {
        "ConnectionsRevokeAccessPackage - status code is 204": (r) =>
            r.status === 204,
        "ConnectionsRevokeAccessPackage - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
