import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Deletes a connection.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {DeleteConnectionQuery|null} [queryParams]
 * Query parameters. Use {@link DeleteConnectionQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if the connection was deleted successfully.
 */
export function DeleteConnection(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = connectionsClient.DeleteConnection(
        queryParams,
        labels,
    );

    const succeed = check(res, {
        "DeleteConnection - status code is 204": (r) =>
            r.status === 204,
        "DeleteConnection - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
