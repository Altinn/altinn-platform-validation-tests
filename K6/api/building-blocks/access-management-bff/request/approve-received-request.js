import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { ApproveReceivedRequestQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Approves an access request a party has received.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {ApproveReceivedRequestQuery|null} [queryParams] Optional query
 * parameters. Use {@link ApproveReceivedRequestQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the request was approved.
 */
export function ApproveReceivedRequest(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.ApproveReceivedRequest(queryParams, labels),
        "ApproveReceivedRequest",
    );

    let approved = false;

    const succeed = check(res, {
        "ApproveReceivedRequest - status code is 200": (r) =>
            r.status === 200,
        "ApproveReceivedRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return approved;
    }

    approved = true;

    return approved;
}
