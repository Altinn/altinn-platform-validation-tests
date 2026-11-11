import { check } from "k6";

import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { SentRequestsQuery } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { RequestDto } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { logFailedRequest } from "../../../common/log-failed-request.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves sent requests for a party.
 *
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {SentRequestsQuery|null} [queryParams]
 * Query parameters. Use {@link SentRequestsV2QueryBuilder}.
 * @param {number|null} [pageSize]
 * Page size header.
 * @param {number|null} [pageNumber]
 * Page number header.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {Array<RequestDto>} Sent requests.
 */
export function GetSentRequests(
    requestClient,
    queryParams = null,
    pageSize = null,
    pageNumber = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetSentRequests(
            queryParams,
            pageSize,
            pageNumber,
            labels,
        ),
        "GetSentRequests",
    );

    /** @type {Array<RequestDto>} */
    let requests = [];

    const succeed = check(res, {
        "GetSentRequests - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        logFailedRequest(res, "GetSentRequests");
        return requests;
    }

    check(res, {
        "GetSentRequests - body is valid": (r) => {
            try {
                const result = JSON.parse(r.body);

                requests = result.data ?? [];

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return requests;
}
