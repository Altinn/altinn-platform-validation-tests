import { check } from "k6";

import { PackagesClient } from "../../../../clients/packages/index.js";

/**
 * Gets resources for a package.
 *
 * @param {PackagesClient} packagesClient Client for the Packages API.
 * @param {string} id Package identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ResourceDto|null} Resource.
 */
export function PackagesGetPackageResourcesById(
    packagesClient,
    id,
    labels = null,
) {
    const res = packagesClient.PackagesGetPackageResourcesById(id, labels);

    /** @type {ResourceDto|null} */
    let resource = null;

    const succeed = check(res, {
        "PackagesGetPackageResourcesById - status code is 200": (r) =>
            r.status === 200,
        "PackagesGetPackageResourcesById - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resource;
    }

    check(res, {
        "PackagesGetPackageResourcesById - body is valid": (r) => {
            try {
                resource = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resource;
}
