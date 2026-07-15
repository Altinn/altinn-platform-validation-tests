import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/access-management/enduser/connections/index.js";

/**
 * Deletes an access package assignment.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {DeleteAccessPackageQuery|null} [queryParams]
 * Query parameters. Use {@link DeleteAccessPackageQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if the access package assignment was deleted successfully.
 */
export function DeleteAccessPackage(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = connectionsClient.DeleteAccessPackage(
        queryParams,
        labels,
    );

    const succeed = check(res, {
        "DeleteAccessPackage - status code is 204": (r) =>
            r.status === 204,
        "DeleteAccessPackage - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
