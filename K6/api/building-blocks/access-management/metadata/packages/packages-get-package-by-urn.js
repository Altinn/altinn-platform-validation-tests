import { check } from "k6";

import { PackagesClient } from "../../../../../clients/access-management/metadata/packages/index.js";
import { PackageDto } from "../../../../../clients/access-management/metadata/roles/roles.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets package by URN.
 *
 * @param {PackagesClient} packagesClient Client for the Packages API.
 * @param {string} urnValue Package URN.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {PackageDto|null} Package.
 */
export function PackagesGetPackageByUrn(
    packagesClient,
    urnValue,
    labels = null,
) {
    const res = withRetries(
        () => packagesClient.PackagesGetPackageByUrn(urnValue, labels),
        "PackagesGetPackageByUrn",
    );

    /** @type {PackageDto|null} */
    let packageDto = null;

    const succeed = check(res, {
        "PackagesGetPackageByUrn - status code is 200": (r) =>
            r.status === 200,
        "PackagesGetPackageByUrn - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return packageDto;
    }

    check(res, {
        "PackagesGetPackageByUrn - body is valid": (r) => {
            try {
                packageDto = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return packageDto;
}
