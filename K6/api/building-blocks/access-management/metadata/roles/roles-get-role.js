import { check } from "k6";

import { RoleDto } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { RolesClient } from "../../../../../clients/access-management/metadata/roles/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets a role.
 *
 * @param {RolesClient} rolesClient Client for the Roles API.
 * @param {string} id Role identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {RoleDto[]|null} The roles the id resolves to.
 */
export function RolesGetRole(
    rolesClient,
    id,
    labels = null,
) {
    const res = withRetries(
        () => rolesClient.RolesGetRole(id, labels),
        "RolesGetRole",
    );

    /** @type {RoleDto[]|null} */
    let role = null;

    const succeed = check(res, {
        "RolesGetRole - status code is 200": (r) =>
            r.status === 200,
        "RolesGetRole - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return role;
    }

    check(res, {
        "RolesGetRole - body is valid": (r) => {
            try {
                role = JSON.parse(r.body);
                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return role;
}
