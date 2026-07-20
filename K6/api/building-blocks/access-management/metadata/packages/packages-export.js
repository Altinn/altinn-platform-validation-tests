import { check } from "k6";

import { PackagesClient } from "../../../../clients/packages/index.js";

/**
 * Exports access packages.
 *
 * @param {PackagesClient} packagesClient Client for the Packages API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AreaGroupDto|null} Access package groups.
 */
export function PackagesExport(
    packagesClient,
    labels = null,
) {
    const res = packagesClient.PackagesExport(labels);

    /** @type {AreaGroupDto|null} */
    let areaGroup = null;

    const succeed = check(res, {
        "PackagesExport - status code is 200": (r) =>
            r.status === 200,
        "PackagesExport - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
