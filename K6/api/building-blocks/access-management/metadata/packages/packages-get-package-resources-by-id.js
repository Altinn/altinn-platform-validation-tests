import { check } from "k6";

import { ResourceDto } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/maskinporten-suppliers.types.js";
import { PackagesClient } from "../../../../../clients/access-management/metadata/packages/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets resources for a package.
 *
 * @param {PackagesClient} packagesClient Client for the Packages API.
 * @param {string} id Package identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ResourceDto|null} Resource.
 */
export function PackagesGetPackageResourcesById(
    packagesClient,
    id,
    labels = null,
) {
    const res = withRetries(
        () => packagesClient.PackagesGetPackageResourcesById(id, labels),
        "PackagesGetPackageResourcesById",
    );

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
