import { check } from "k6";

import { GetAccessPackagesQuery, PackagePermissionDtoPaginatedResult } from "../../../../../clients/access-management/enduser/connections/connections.types.js";
import { ConnectionsClient } from "../../../../../clients/access-management/enduser/connections/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves access package permissions for connections.
 *
 * @param {ConnectionsClient} connectionsClient Client for the Connections API.
 * @param {GetAccessPackagesQuery|null} [queryParams]
 * Query parameters. Use {@link GetAccessPackagesQueryBuilder}.
 * @param {{[key: string]: string|number}|null} [headers]
 * Optional request headers.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {PackagePermissionDtoPaginatedResult|null} Paginated access package permissions result.
 */
export function GetAccessPackages(
    connectionsClient,
    queryParams = null,
    headers = null,
    labels = null,
) {
    const res = withRetries(
        () => connectionsClient.GetAccessPackages(
            queryParams,
            headers,
            labels,
        ),
        "GetAccessPackages",
    );

    /** @type {PackagePermissionDtoPaginatedResult|null} */
    let packages = null;

    const succeed = check(res, {
        "GetAccessPackages - status code is 200": (r) =>
            r.status === 200,
        "GetAccessPackages - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return packages;
    }

    check(res, {
        "GetAccessPackages - body is valid": (r) => {
            try {
                packages = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return packages;
}
