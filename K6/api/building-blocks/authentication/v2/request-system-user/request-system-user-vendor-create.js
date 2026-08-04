import { check } from "k6";

import { RequestSystemUserClient } from "../../../../../clients/authentication/v2/index.js";

/**
 * Creates a new system user request.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {CreateRequestSystemUser} request Request model.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RequestSystemResponse|null} Request response.
 */
export function RequestSystemUserVendorCreate(
    requestSystemUserClient,
    request,
    labels = null,
) {
    const res = requestSystemUserClient.CreateRequest(
        request,
        labels,
    );

    /** @type {RequestSystemResponse|null} */
    let requestResponse = null;

    const succeed = check(res, {
        "RequestSystemUserVendorCreate - status code is 201": (r) =>
            r.status === 201,
        "RequestSystemUserVendorCreate - status text is 201 Created": (r) =>
            r.status_text === "201 Created",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponse;
    }

    check(res, {
        "RequestSystemUserVendorCreate - body is valid": (r) => {
            try {
                requestResponse = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return requestResponse;
}
