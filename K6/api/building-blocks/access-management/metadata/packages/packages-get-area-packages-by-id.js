import { check } from "k6";

import { PackagesClient } from "../../../../clients/packages/index.js";

/**
 * Gets packages for an area.
 *
 * @param {PackagesClient} packagesClient Client for the Packages API.
 * @param {string} id Area identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {PackageDto|null} Package.
 */
export function PackagesGetAreaPackagesById(
    packagesClient,
    id,
    labels = null,
) {
    const res = packagesClient.PackagesGetAreaPackagesById(id, labels);

    /** @type {PackageDto|null} */
    let packageDto = null;

    const succeed = check(res, {
        "PackagesGetAreaPackagesById - status code is 200": (r) =>
            r.status === 200,
        "PackagesGetAreaPackagesById - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return packageDto;
    }

    check(res, {
        "PackagesGetAreaPackagesById - body is valid": (r) => {
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
