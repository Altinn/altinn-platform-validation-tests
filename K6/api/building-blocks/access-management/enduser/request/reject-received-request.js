import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";
import { RequestDto } from "../../../../../clients/access-management/service-owner/request/request.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Rejects a received request.
 *
 * @param {RequestClient} requestClient Client for the Access Management Request API.
 * @param {string} party Party UUID.
 * @param {string} id Request UUID.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {RequestDto|null} Rejected request.
 */
export function RejectReceivedRequest(
    requestClient,
    party,
    id,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.RejectReceivedRequest(
            party,
            id,
            labels,
        ),
        "RejectReceivedRequest",
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "RejectReceivedRequest - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return request;
    }

    check(res, {
        "RejectReceivedRequest - body is valid": (r) => {
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
