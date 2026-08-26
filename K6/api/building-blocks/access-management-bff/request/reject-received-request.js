import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { RejectReceivedRequestQuery } from "../../../../clients/access-management-bff/request/request.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Rejects an access request a party has received.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {RejectReceivedRequestQuery|null} [queryParams] Optional query
 * parameters. Use {@link RejectReceivedRequestQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the request was rejected.
 */
export function RejectReceivedRequest(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.RejectReceivedRequest(queryParams, labels),
        "RejectReceivedRequest",
    );

    let rejected = false;

    const succeed = check(res, {
        "RejectReceivedRequest - status code is 200": (r) =>
            r.status === 200,
        "RejectReceivedRequest - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rejected;
    }

    rejected = true;

    return rejected;
}
