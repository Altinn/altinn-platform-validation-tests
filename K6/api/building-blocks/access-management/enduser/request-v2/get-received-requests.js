import { check } from "k6";

import { RequestV2Client } from "../../../../../clients/access-management/enduser/request-v2/index.js";
import { ReceivedRequestsQuery } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { RequestDto } from "../../../../../clients/access-management/enduser/request-v2/request-v2.types.js";
import { logFailedRequest } from "../../../common/log-failed-request.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves received requests for a party.
 *
 * @param {RequestV2Client} requestClient Client for the v2 enduser Request API.
 * @param {ReceivedRequestsQuery|null} [queryParams]
 * Query parameters. Use {@link ReceivedRequestsV2QueryBuilder}.
 * @param {number|null} [pageSize]
 * Page size header.
 * @param {number|null} [pageNumber]
 * Page number header.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {Array<RequestDto>} Received requests.
 */
export function GetReceivedRequests(
    requestClient,
    queryParams = null,
    pageSize = null,
    pageNumber = null,
    labels = null,
) {
    const res = withRetries(
        () => requestClient.GetReceivedRequests(
            queryParams,
            pageSize,
            pageNumber,
            labels,
        ),
        "GetReceivedRequests",
    );

    /** @type {Array<RequestDto>} */
    let requests = [];

    const succeed = check(res, {
        "GetReceivedRequests - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        logFailedRequest(res, "GetReceivedRequests");
        return requests;
    }

    check(res, {
        "GetReceivedRequests - body is valid": (r) => {
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
