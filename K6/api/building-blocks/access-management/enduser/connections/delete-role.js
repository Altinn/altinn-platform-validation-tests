import { check } from "k6";

import { DeleteRoleQuery } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Deletes a role permission.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {DeleteRoleQuery|null} [queryParams]
 * Query parameters. Use {@link DeleteRoleQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if the role permission was successfully deleted.
 */
export function DeleteRole(
    connectionsClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.DeleteRole(
            queryParams,
            labels,
        ),
        "DeleteRole",
    );

    const succeed = check(res, {
        "DeleteRole - status code is 204": (r) =>
            r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
