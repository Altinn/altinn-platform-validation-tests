import { check } from "k6";

import { RolePermission } from "../../../../clients/access-management-bff/common/common.types.js";
import { RoleClient } from "../../../../clients/access-management-bff/role/index.js";
import { GetRolePermissionsQuery } from "../../../../clients/access-management-bff/role/role.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the roles one party holds for another, with the permissions behind
 * them.
 *
 * @param {RoleClient} roleClient Client for the role endpoints.
 * @param {GetRolePermissionsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetRolePermissionsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<RolePermission>|null} The role permissions.
 */
export function GetRolePermissions(
    roleClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => roleClient.GetRolePermissions(queryParams, labels),
        "GetRolePermissions",
    );

    /** @type {Array<RolePermission>|null} */
    let rolePermissions = null;

    const succeed = check(res, {
        "GetRolePermissions - status code is 200": (r) =>
            r.status === 200,
        "GetRolePermissions - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rolePermissions;
    }

    check(res, {
        "GetRolePermissions - body is valid": (r) => {
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
