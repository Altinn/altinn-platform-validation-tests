import { check } from "k6";

import { DeleteResourceQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Deletes a resource permission.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {DeleteResourceQuery|null} [queryParams]
 * Query parameters. Use {@link DeleteResourceQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if the resource permission was successfully deleted.
 */
export function DeleteResource(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.DeleteResource(
            queryParams,
            labels,
        ),
        "DeleteResource",
    );

    const succeed = check(res, {
        "DeleteResource - status code is 204": (r) =>
            r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
