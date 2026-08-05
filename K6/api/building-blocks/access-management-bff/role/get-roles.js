import { check } from "k6";

import { RoleClient } from "../../../../clients/access-management-bff/role/index.js";

/**
 * Gets the roles the API knows about.
 *
 * @param {RoleClient} roleClient Client for the role endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<Role>|null} The roles.
 */
export function GetRoles(roleClient, labels = null) {
    const res = roleClient.GetRoles(labels);

    /** @type {Array<Role>|null} */
    let roles = null;

    const succeed = check(res, {
        "GetRoles - status code is 200": (r) =>
            r.status === 200,
        "GetRoles - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return roles;
    }

    check(res, {
        "GetRoles - body is valid": (r) => {
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
