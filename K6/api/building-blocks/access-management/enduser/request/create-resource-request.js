import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";

/**
 * Creates a resource request.
 *
 * @param {RequestClient} requestClient Client for the Access Management Request API.
 * @param {string} party Party UUID.
 * @param {string} to Party UUID.
 * @param {string} resource Resource identifier.
 * @param {Array<string>|null} [rights]
 * Optional rights.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {RequestDto|null} Created request.
 */
export function CreateResourceRequest(
    requestClient,
    party,
    to,
    resource,
    rights = null,
    labels = null,
) {
    const res = requestClient.CreateResourceRequest(
        party,
        to,
        resource,
        rights,
        labels,
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "CreateResourceRequest - status code is 200": (r) =>
            r.status === 200,
        "CreateResourceRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return request;
    }

    check(res, {
        "CreateResourceRequest - body is valid": (r) => {
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
