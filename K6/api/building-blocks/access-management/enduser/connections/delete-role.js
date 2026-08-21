import { check } from "k6";

import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { DeleteRoleQuery } from "../../../../../clients/access-management-bff/role/role.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Deletes a role permission.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {DeleteRoleQuery|null} [queryParams]
 * Query parameters. Use {@link DeleteRoleQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
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
        "DeleteRole - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
