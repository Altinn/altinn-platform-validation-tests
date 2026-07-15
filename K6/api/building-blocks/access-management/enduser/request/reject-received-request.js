import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";

/**
 * Rejects a received request.
 *
 * @param {RequestClient} requestClient Client for the Access Management Request API.
 * @param {string} party Party UUID.
 * @param {string} id Request UUID.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {RequestDto|null} Rejected request.
 */
export function RejectReceivedRequest(
    requestClient,
    party,
    id,
    labels = null,
) {
    const res = requestClient.RejectReceivedRequest(
        party,
        id,
        labels,
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "RejectReceivedRequest - status code is 200": (r) =>
            r.status === 200,
        "RejectReceivedRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
