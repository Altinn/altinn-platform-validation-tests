import { check } from "k6";

import { DeleteConnectionQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Deletes a connection.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {DeleteConnectionQuery|null} [queryParams]
 * Query parameters. Use {@link DeleteConnectionQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if the connection was deleted successfully.
 */
export function DeleteConnection(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.DeleteConnection(
            queryParams,
            labels,
        ),
        "DeleteConnection",
    );

    const succeed = check(res, {
        "DeleteConnection - status code is 204": (r) =>
            r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
