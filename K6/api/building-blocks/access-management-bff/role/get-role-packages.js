import { check } from "k6";

import { AccessPackage } from "../../../../clients/access-management-bff/common/common.types.js";
import { RoleClient } from "../../../../clients/access-management-bff/role/index.js";
import { GetRolePackagesQuery } from "../../../../clients/access-management-bff/role/role.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the access packages a role grants.
 *
 * @param {RoleClient} roleClient Client for the role endpoints.
 * @param {GetRolePackagesQuery|null} [queryParams] Optional query parameters.
 * Use {@link GetRolePackagesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<AccessPackage>|null} The access packages.
 */
export function GetRolePackages(
    roleClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => roleClient.GetRolePackages(queryParams, labels),
        "GetRolePackages",
    );

    /** @type {Array<AccessPackage>|null} */
    let accessPackages = null;

    const succeed = check(res, {
        "GetRolePackages - status code is 200": (r) =>
            r.status === 200,
        "GetRolePackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return accessPackages;
    }

    check(res, {
        "GetRolePackages - body is valid": (r) => {
            try {
                accessPackages = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return accessPackages;
}
