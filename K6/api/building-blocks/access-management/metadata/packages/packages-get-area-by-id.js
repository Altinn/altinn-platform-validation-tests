import { check } from "k6";

import { PackagesClient } from "../../../../../clients/access-management/metadata/packages/index.js";
import { AreaDto } from "../../../../../clients/access-management/metadata/roles/roles.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets area by id.
 *
 * @param {PackagesClient} packagesClient Client for the Packages API.
 * @param {string} id Area identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AreaDto|null} Area.
 */
export function PackagesGetAreaById(
    packagesClient,
    id,
    labels = null,
) {
    const res = withRetries(
        () => packagesClient.PackagesGetAreaById(id, labels),
        "PackagesGetAreaById",
    );

    /** @type {AreaDto|null} */
    let area = null;

    const succeed = check(res, {
        "PackagesGetAreaById - status code is 200": (r) =>
            r.status === 200,
        "PackagesGetAreaById - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return area;
    }

    check(res, {
        "PackagesGetAreaById - body is valid": (r) => {
            try {
                area = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return area;
}
