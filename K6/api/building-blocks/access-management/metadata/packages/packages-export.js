import { check } from "k6";

import { PackagesClient } from "../../../../../clients/access-management/metadata/packages/index.js";
import { AreaGroupDto } from "../../../../../clients/access-management/metadata/roles/roles.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Exports access packages.
 *
 * @param {PackagesClient} packagesClient Client for the Packages API.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AreaGroupDto[]|null} Access package groups.
 */
export function PackagesExport(
    packagesClient,
    labels = null,
) {
    const res = withRetries(
        () => packagesClient.PackagesExport(labels),
        "PackagesExport",
    );

    /** @type {AreaGroupDto[]|null} */
    let areaGroup = null;

    const succeed = check(res, {
        "PackagesExport - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return areaGroup;
    }

    check(res, {
        "PackagesExport - body is valid": (r) => {
            try {
                areaGroup = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return areaGroup;
}
