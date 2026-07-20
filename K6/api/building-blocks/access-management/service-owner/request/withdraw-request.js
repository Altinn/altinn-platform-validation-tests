import { check } from "k6";

import { RequestClient } from "../../../../clients/request/index.js";

/**
 * Withdraws a delegation request.
 *
 * @param {RequestClient} requestClient Client for the Request API.
 * @param {string} id Request identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {RequestStatus|null} Updated request status.
 */
export function RequestWithdrawRequest(
    requestClient,
    id,
    labels = null,
) {
    const res = requestClient.RequestWithdrawRequest(id, labels);

    /** @type {RequestStatus|null} */
    let status = null;

    const succeed = check(res, {
        "RequestWithdrawRequest - status code is 200": (r) =>
            r.status === 200,
        "RequestWithdrawRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return status;
    }

    check(res, {
        "RequestWithdrawRequest - body is valid": (r) => {
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
