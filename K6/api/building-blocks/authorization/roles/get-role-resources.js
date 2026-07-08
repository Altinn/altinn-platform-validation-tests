import { check } from "k6";

import { RolesApiClient } from "../../../../clients/authorization/index.js";
import {
    RoleResourcesResponse,
} from "../../../../clients/authorization/index.js";

/**
 * Get resources for role
 *
 * GET /meta/info/roles/resources
 *
 * @param {RolesApiClient} rolesApiClient TODO: description
 * @param {string} role TODO: description
 * @param {string} variant TODO: description
 * @param {boolean} [includePackageResources] TODO: description
 * @param {{[x: string]: string}} [labels] TODO: description
 * @returns {RoleResourcesResponse} TODO: description
 */
export function GetRoleResources(
    rolesApiClient,
    role,
    variant,
    includePackageResources = false,
    labels = null
) {
    const res = rolesApiClient.GetRoleResources(
        role,
        variant,
        includePackageResources,
        labels
    );

    /** @type {RoleResourcesResponse} */
    let res_body = null;

    const succeed = check(res, {
        "GetRoleResources - status code is 200": (r) => r.status === 200,
        "GetRoleResources - status text is 200 OK": (r) => r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return res_body;
    }

    check(res, {
        "GetRoleResources - body is valid": (r) => {
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
