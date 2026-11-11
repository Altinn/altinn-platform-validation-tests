import { check } from "k6";

import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { SentRequestsQuery } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { logFailedRequest } from "../../../common/log-failed-request.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves count of sent requests for a party.
 *
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {SentRequestsQuery|null} [queryParams]
 * Query parameters. Use {@link SentRequestsV2QueryBuilder}.
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
        logFailedRequest(res, "GetSentRequestsCount");
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
