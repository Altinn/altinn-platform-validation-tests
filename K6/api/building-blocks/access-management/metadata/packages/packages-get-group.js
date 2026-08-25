import { check } from "k6";

import { PackagesClient } from "../../../../../clients/access-management/metadata/packages/index.js";
import { AreaGroupDto } from "../../../../../clients/access-management/metadata/roles/roles.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets access package group.
 *
 * @param {PackagesClient} packagesClient Client for the Packages API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AreaGroupDto|null} Area group.
 */
export function PackagesGetGroup(
    packagesClient,
    labels = null,
) {
    const res = withRetries(
        () => packagesClient.PackagesGetGroup(labels),
        "PackagesGetGroup",
    );

    /** @type {AreaGroupDto|null} */
    let areaGroup = null;

    const succeed = check(res, {
        "PackagesGetGroup - status code is 200": (r) =>
            r.status === 200,
        "PackagesGetGroup - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return areaGroup;
    }

    check(res, {
        "PackagesGetGroup - body is valid": (r) => {
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
