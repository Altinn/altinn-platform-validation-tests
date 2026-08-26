import { check } from "k6";

import { RequestSystemUserClient } from "../../../../clients/authentication/index.js";
import { RequestSystemResponse } from "../../../../clients/authentication/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves a system user request by id.
 *
 * @param {RequestSystemUserClient} requestSystemUserClient Client for the Request System User API.
 * @param {string} requestId Request identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {RequestSystemResponse|null} Request response.
 */
export function RequestSystemUserVendorGet(
    requestSystemUserClient,
    requestId,
    labels = null,
) {
    const res = withRetries(
        () =>
            requestSystemUserClient.RequestSystemUserVendorGet(
                requestId,
                labels,
            ),
        "RequestSystemUserVendorGet",
    );

    /** @type {RequestSystemResponse|null} */
    let requestResponse = null;

    const succeed = check(res, {
        "RequestSystemUserVendorGet - status code is 200": (r) =>
            r.status === 200,
        "RequestSystemUserVendorGet - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return requestResponse;
    }

    check(res, {
        "RequestSystemUserVendorGet - body is valid": (r) => {
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
