import { check } from "k6";

import { RolesApiClient } from "../../../../clients/authorization/index.js";
import {
    RoleResourcesByRoleResponse,
} from "../../../../clients/authorization/index.js";

/**
 * Get resources by role ID
 *
 * GET /meta/info/roles/{id}/resources
 *
 * @param {RolesApiClient} rolesApiClient TODO: description
 * @param {string} id Role UUID
 * @param {string} variant TODO: description
 * @param {boolean} [includePackageResources] TODO: description
 * @param {{[x: string]: string}} [labels] TODO: description
 * @returns {RoleResourcesByRoleResponse} TODO: description
 */
export function GetRoleResourcesById(
    rolesApiClient,
    id,
    variant,
    includePackageResources = false,
    labels = null
) {
    const res = rolesApiClient.GetRoleResourcesById(
        id,
        variant,
        includePackageResources,
        labels
    );

    /** @type {RoleResourcesByRoleResponse} */
    let res_body = null;

    const succeed = check(res, {
        "GetRoleResourcesById - status code is 200": (r) => r.status === 200,
        "GetRoleResourcesById - status text is 200 OK": (r) => r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res_body;
    }

    check(res, {
        "GetRoleResourcesById - body is valid": (r) => {
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
