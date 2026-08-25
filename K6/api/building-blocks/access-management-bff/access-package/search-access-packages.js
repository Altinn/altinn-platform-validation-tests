import { check } from "k6";

import { SearchAccessPackagesQuery } from "../../../../clients/access-management-bff/access-package/access-package.types.js";
import { AccessPackageClient } from "../../../../clients/access-management-bff/access-package/index.js";
import { AccessAreaFE } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Searches access packages, grouped by access area.
 *
 * @param {AccessPackageClient} accessPackageClient Client for the access
 * package endpoints.
 * @param {SearchAccessPackagesQuery|null} [queryParams] Optional query
 * parameters. Use {@link SearchAccessPackagesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<AccessAreaFE>|null} Access areas with their packages.
 */
export function SearchAccessPackages(
    accessPackageClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => accessPackageClient.SearchAccessPackages(queryParams, labels),
        "SearchAccessPackages",
    );

    /** @type {Array<AccessAreaFE>|null} */
    let areas = null;

    const succeed = check(res, {
        "SearchAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "SearchAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return areas;
    }

    check(res, {
        "SearchAccessPackages - body is valid": (r) => {
            try {
                areas = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return areas;
}
