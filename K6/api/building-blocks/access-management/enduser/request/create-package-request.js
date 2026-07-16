import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";

/**
 * Creates a package request.
 *
 * @param {RequestClient} requestClient Client for the Access Management Request API.
 * @param {string} party Party UUID.
 * @param {string} to Party UUID.
 * @param {string} packageId Package identifier.
 * @param {{[key: string]: string}} [labels]
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
    const res = requestClient.CreatePackageRequest(
        party,
        to,
        packageId,
        labels,
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "CreatePackageRequest - status code is 200": (r) =>
            r.status === 200,
        "CreatePackageRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
