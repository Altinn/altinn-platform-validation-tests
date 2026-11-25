import { check } from "k6";

import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { ApproveRequestDto, RequestDto } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Approves a received request.
 *
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {string} party Party UUID.
 * @param {string} id Request UUID.
 * @param {ApproveRequestDto|null} [body]
 * The right keys to approve.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {RequestDto|null} Approved request.
 */
export function ApproveReceivedRequest(
    requestClient,
    party,
    id,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.ApproveReceivedRequest(
            party,
            id,
            body,
            labels,
        ),
        "ApproveReceivedRequest",
    );

    /** @type {RequestDto|null} */
    let request = null;

    const succeed = check(res, {
        "ApproveReceivedRequest - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return request;
    }

    check(res, {
        "ApproveReceivedRequest - body is valid": (r) => {
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
