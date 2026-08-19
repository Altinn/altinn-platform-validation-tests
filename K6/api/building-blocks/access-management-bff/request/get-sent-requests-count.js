import { check } from "k6";

import { RequestClient } from "../../../../clients/access-management-bff/request/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the number of access requests a party has sent.
 *
 * @param {RequestClient} requestClient Client for the access request
 * endpoints.
 * @param {GetSentRequestsCountQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetSentRequestsCountQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} The sent request count. The API does not publish a
 * schema for this response.
 */
export function GetSentRequestsCount(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetSentRequestsCount(queryParams, labels),
        "GetSentRequestsCount",
    );

    /** @type {object|null} */
    let count = null;

    const succeed = check(res, {
        "GetSentRequestsCount - status code is 200": (r) =>
            r.status === 200,
        "GetSentRequestsCount - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return count;
    }

    check(res, {
        "GetSentRequestsCount - body is valid": (r) => {
            try {
                count = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return count;
}
