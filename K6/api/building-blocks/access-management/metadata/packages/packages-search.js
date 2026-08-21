import { check } from "k6";

import { PackagesClient } from "../../../../../clients/access-management/metadata/packages/index.js";
import { PackageDtoSearchObject, PackagesSearchQueryBuilder } from "../../../../../clients/access-management/metadata/packages/packages.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Searches access packages.
 *
 * @param {PackagesClient} packagesClient Client for the Packages API.
 * @param {PackagesSearchQueryBuilder | object} query Query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<PackageDtoSearchObject>|null} Search results.
 */
export function PackagesSearch(
    packagesClient,
    query,
    labels = null,
) {
    const res = withRetries(
        () => packagesClient.PackagesSearch(query, labels),
        "PackagesSearch",
    );

    /** @type {Array<PackageDtoSearchObject>|null} */
    let packages = null;

    const succeed = check(res, {
        "PackagesSearch - status code is 200": (r) =>
            r.status === 200,
        "PackagesSearch - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return packages;
    }

    check(res, {
        "PackagesSearch - body is valid": (r) => {
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
