import { check } from "k6";

import { GetAccessPackagePermissionQuery } from "../../../../clients/access-management-bff/access-package/access-package.types.js";
import { AccessPackageClient } from "../../../../clients/access-management-bff/access-package/index.js";
import { AccessPackageFE } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets a single access package with the permissions behind it.
 *
 * @param {AccessPackageClient} accessPackageClient Client for the access
 * package endpoints.
 * @param {string} packageId Access package UUID.
 * @param {GetAccessPackagePermissionQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetAccessPackagePermissionQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AccessPackageFE|null} The access package.
 */
export function GetAccessPackagePermission(
    accessPackageClient,
    packageId,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => accessPackageClient.GetAccessPackagePermission(
            packageId,
            queryParams,
            labels,
        ),
        "GetAccessPackagePermission",
    );

    /** @type {AccessPackageFE|null} */
    let accessPackage = null;

    const succeed = check(res, {
        "GetAccessPackagePermission - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return accessPackage;
    }

    check(res, {
        "GetAccessPackagePermission - body is valid": (r) => {
            try {
                accessPackage = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return accessPackage;
}
