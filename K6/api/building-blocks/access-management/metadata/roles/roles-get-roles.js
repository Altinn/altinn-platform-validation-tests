import { check } from "k6";

import { RoleDto } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { RolesClient } from "../../../../../clients/access-management/metadata/roles/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets roles.
 *
 * @param {RolesClient} rolesClient Client for the Roles API.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<RoleDto>|null} Roles.
 */
export function RolesGetRoles(
    rolesClient,
    labels = null,
) {
    const res = withRetries(
        () => rolesClient.RolesGetRoles(labels),
        "RolesGetRoles",
    );

    /** @type {Array<RoleDto>|null} */
    let roles = null;

    const succeed = check(res, {
        "RolesGetRoles - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return roles;
    }

    check(res, {
        "RolesGetRoles - body is valid": (r) => {
            try {
                roles = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return roles;
}
