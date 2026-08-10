import { check } from "k6";

import { RolesApiClient } from "../../../../clients/authorization/index.js";
import {
    RolePackagesByRoleResponse,
} from "../../../../clients/authorization/index.js";

/**
 * Get packages by role ID
 *
 * GET /meta/info/roles/{id}/packages
 *
 * @param {RolesApiClient} rolesApiClient TODO: description
 * @param {string} id Role UUID
 * @param {string} variant TODO: description
 * @param {boolean} [includeResources] TODO: description
 * @param {{[x: string]: string}} [labels] TODO: description
 * @returns {RolePackagesByRoleResponse} TODO: description
 */
export function GetRolePackagesById(
    rolesApiClient,
    id,
    variant,
    includeResources = false,
    labels = null
) {
    const res = rolesApiClient.GetRolePackagesById(
        id,
        variant,
        includeResources,
        labels
    );

    /** @type {RolePackagesByRoleResponse} */
    let res_body = null;

    const succeed = check(res, {
        "GetRolePackagesById - status code is 200": (r) => r.status === 200,
        "GetRolePackagesById - status text is 200 OK": (r) => r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res_body;
    }

    check(res, {
        "GetRolePackagesById - body is valid": (r) => {
            try {
                res_body = JSON.parse(r.body);
                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);
                return false;
            }
        },
    });

    return res_body;
}
