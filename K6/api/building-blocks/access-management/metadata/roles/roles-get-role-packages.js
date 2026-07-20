import { check } from "k6";

import { RolesClient } from "../../../../clients/roles/index.js";

/**
 * Gets role packages.
 *
 * @param {RolesClient} rolesClient Client for the Roles API.
 * @param {RolesGetRolePackagesQueryBuilder|Object} query Query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {PackageDto|null} Role package.
 */
export function RolesGetRolePackages(
    rolesClient,
    query,
    labels = null,
) {
    const res = rolesClient.RolesGetRolePackages(query, labels);

    /** @type {PackageDto|null} */
    let rolePackage = null;

    const succeed = check(res, {
        "RolesGetRolePackages - status code is 200": (r) =>
            r.status === 200,
        "RolesGetRolePackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rolePackage;
    }

    check(res, {
        "RolesGetRolePackages - body is valid": (r) => {
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
