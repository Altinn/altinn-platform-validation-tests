import { check } from "k6";

import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { RequestDto } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Creates a package request.
 *
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {string} party Party UUID.
 * @param {string} to Party UUID.
 * @param {string} packageId Package identifier.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {RequestDto|null} Created request.
 */
export function CreatePackageRequest(
    requestClient,
    party,
    to,
    packageId,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.CreatePackageRequest(
            party,
            to,
            packageId,
            labels,
        ),
        "CreatePackageRequest",
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "CreatePackageRequest - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return request;
    }

    check(res, {
        "CreatePackageRequest - body is valid": (r) => {
            try {
                request = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return request;
}
