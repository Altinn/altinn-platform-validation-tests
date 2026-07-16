import { check } from "k6";

import { ConnectionsClient } from "../../../../clients/connections/index.js";

/**
 * Gets role permissions.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetRolesQuery|null} [queryParams]
 * Query parameters. Use {@link GetRolesQueryBuilder}.
 * @param {{[key: string]: string|number}} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {RolePermissionDtoPaginatedResult|null} Retrieved role permissions.
 */
export function GetRoles(
    connectionsClient,
    queryParams = null,
    headers = {
        "X-Page-Size": 100,
        "X-Page-Number": 0,
    },
    labels = null,
) {
    const res = connectionsClient.GetRoles(
        queryParams,
        headers,
        labels,
    );

    /** @type {RolePermissionDtoPaginatedResult|null} */
    let rolePermissions = null;

    const succeed = check(res, {
        "GetRoles - status code is 200": (r) =>
            r.status === 200,
        "GetRoles - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rolePermissions;
    }

    check(res, {
        "GetRoles - body is valid": (r) => {
            try {
                rolePermissions = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return rolePermissions;
}
