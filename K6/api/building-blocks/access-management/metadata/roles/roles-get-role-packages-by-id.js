import { check } from "k6";

import { RolesClient } from "../../../../clients/roles/index.js";

/**
 * Gets role packages by role id.
 *
 * @param {RolesClient} rolesClient Client for the Roles API.
 * @param {string} id Role identifier.
 * @param {RolesGetRolePackagesByIdQueryBuilder|Object} query Query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {PackageDto|null} Role package.
 */
export function RolesGetRolePackagesById(
    rolesClient,
    id,
    query,
    labels = null,
) {
    const res = rolesClient.RolesGetRolePackagesById(id, query, labels);

    /** @type {PackageDto|null} */
    let rolePackage = null;

    const succeed = check(res, {
        "RolesGetRolePackagesById - status code is 200": (r) =>
            r.status === 200,
        "RolesGetRolePackagesById - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rolePackage;
    }

    check(res, {
        "RolesGetRolePackagesById - body is valid": (r) => {
            try {
                rolePackage = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return rolePackage;
}
