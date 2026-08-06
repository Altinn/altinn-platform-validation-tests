import { check } from "k6";

import { RolesApiClient } from "../../../../clients/authorization/index.js";
import {
    RolePackagesResponse,
} from "../../../../clients/authorization/index.js";

/**
 * Get packages for role
 *
 * GET /meta/info/roles/packages
 *
 * @param {RolesApiClient} rolesApiClient TODO: description
 * @param {string} role TODO: description
 * @param {string} variant TODO: description
 * @param {boolean} [includeResources] TODO: description
 * @param {{[x: string]: string}} [labels] TODO: description
 * @returns {RolePackagesResponse} TODO: description
 */
export function GetRolePackages(
    rolesApiClient,
    role,
    variant,
    includeResources = false,
    labels = null
) {
    const res = rolesApiClient.GetRolePackages(
        role,
        variant,
        includeResources,
        labels
    );

    /** @type {RolePackagesResponse} */
    let res_body = null;

    const succeed = check(res, {
        "GetRolePackages - status code is 200": (r) => r.status === 200,
        "GetRolePackages - status text is 200 OK": (r) => r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res_body;
    }

    check(res, {
        "GetRolePackages - body is valid": (r) => {
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
