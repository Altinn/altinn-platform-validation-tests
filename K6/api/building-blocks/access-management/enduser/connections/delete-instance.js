import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Deletes an instance permission.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {DeleteInstanceQuery|null} [queryParams]
 * Query parameters. Use {@link DeleteInstanceQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if deletion succeeded.
 */
export function DeleteInstance(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = connectionsClient.DeleteInstance(
        queryParams,
        labels,
    );

    return check(res, {
        "DeleteInstance - status code is 204": (r) =>
            r.status === 204,
        "DeleteInstance - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });
}
