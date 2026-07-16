import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Deletes a resource permission.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {DeleteResourceQuery|null} [queryParams]
 * Query parameters. Use {@link DeleteResourceQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if the resource permission was successfully deleted.
 */
export function DeleteResource(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = connectionsClient.DeleteResource(
        queryParams,
        labels,
    );

    const succeed = check(res, {
        "DeleteResource - status code is 204": (r) =>
            r.status === 204,
        "DeleteResource - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
