import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";
import { ReceivedRequestsQuery } from "../../../../../clients/access-management/enduser/request/request.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves count of received requests for a party.
 *
 * @param {RequestClient} requestClient Client for the Access Management Request API.
 * @param {ReceivedRequestsQuery|null} [queryParams]
 * Query parameters. Use {@link ReceivedRequestsQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {number} Number of received requests.
 */
export function GetReceivedRequestsCount(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetReceivedRequestsCount(
            queryParams,
            labels,
        ),
        "GetReceivedRequestsCount",
    );

    /** @type {number} */
    let count = 0;

    const succeed = check(res, {
        "GetReceivedRequestsCount - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return count;
    }

    check(res, {
        "GetReceivedRequestsCount - body is valid": (r) => {
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
