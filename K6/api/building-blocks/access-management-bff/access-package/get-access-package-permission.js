import { check } from "k6";

import { AccessPackageClient } from "../../../../../clients/access-management-bff/access-package/index.js";

/**
 * Gets a single access package with the permissions behind it.
 *
 * @param {AccessPackageClient} accessPackageClient Client for the access
 * package endpoints.
 * @param {string} packageId Access package UUID.
 * @param {GetAccessPackagePermissionQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetAccessPackagePermissionQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AccessPackageFE|null} The access package.
 */
export function GetAccessPackagePermission(
    accessPackageClient,
    packageId,
    queryParams = null,
    labels = null,
) {
    const res = accessPackageClient.GetAccessPackagePermission(
        packageId,
        queryParams,
        labels,
    );

    /** @type {AccessPackageFE|null} */
    let accessPackage = null;

    const succeed = check(res, {
        "GetAccessPackagePermission - status code is 200": (r) =>
            r.status === 200,
        "GetAccessPackagePermission - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
