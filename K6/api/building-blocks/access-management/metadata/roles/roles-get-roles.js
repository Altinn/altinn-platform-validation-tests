import { check } from "k6";

import { RolesClient } from "../../../../clients/roles/index.js";

/**
 * Gets roles.
 *
 * @param {RolesClient} rolesClient Client for the Roles API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<RoleDto>|null} Roles.
 */
export function RolesGetRoles(
    rolesClient,
    labels = null,
) {
    const res = rolesClient.RolesGetRoles(labels);

    /** @type {Array<RoleDto>|null} */
    let roles = null;

    const succeed = check(res, {
        "RolesGetRoles - status code is 200": (r) =>
            r.status === 200,
        "RolesGetRoles - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
