import { check } from "k6";

import { DeleteInstanceQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Deletes an instance permission.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {DeleteInstanceQuery|null} [queryParams]
 * Query parameters. Use {@link DeleteInstanceQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if deletion succeeded.
 */
export function DeleteInstance(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.DeleteInstance(
            queryParams,
            labels,
        ),
        "DeleteInstance",
    );

    return check(res, {
        "DeleteInstance - status code is 204": (r) =>
            r.status === 204,
    });
}
