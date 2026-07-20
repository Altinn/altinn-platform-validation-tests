import { check } from "k6";

import { PackagesClient } from "../../../../clients/packages/index.js";

/**
 * Gets package by URN.
 *
 * @param {PackagesClient} packagesClient Client for the Packages API.
 * @param {string} urnValue Package URN.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {PackageDto|null} Package.
 */
export function PackagesGetPackageByUrn(
    packagesClient,
    urnValue,
    labels = null,
) {
    const res = packagesClient.PackagesGetPackageByUrn(urnValue, labels);

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
