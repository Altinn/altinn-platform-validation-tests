import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/service-owner/request/index.js";
import { RequestStatus } from "../../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Gets request status.
 *
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {string} id Request identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RequestStatus|null} Request status.
 */
export function RequestGetRequestStatus(
    requestClient,
    id,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.RequestGetRequestStatus(id, labels),
        "RequestGetRequestStatus",
    );

    /** @type {RequestStatus|null} */
    let status = null;

    const succeed = check(res, {
        "RequestGetRequestStatus - status code is 200": (r) =>
            r.status === 200,
        "RequestGetRequestStatus - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return status;
    }

    check(res, {
        "RequestGetRequestStatus - body is valid": (r) => {
            try {
                status = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return status;
}
