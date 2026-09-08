import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";
import { SentRequestsQuery } from "../../../../../clients/access-management/enduser/request/request.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves count of sent requests for a party.
 *
 * @param {RequestClient} requestClient Client for the Access Management Request API.
 * @param {SentRequestsQuery|null} [queryParams]
 * Query parameters. Use {@link SentRequestsQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {number} Number of sent requests.
 */
export function GetSentRequestsCount(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetSentRequestsCount(
            queryParams,
            labels,
        ),
        "GetSentRequestsCount",
    );

    /** @type {number} */
    let count = 0;

    const succeed = check(res, {
        "GetSentRequestsCount - status code is 200": (r) =>
            r.status === 200,
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
