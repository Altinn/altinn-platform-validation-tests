import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";
import { SentRequestsQuery } from "../../../../../clients/access-management/enduser/request/request.types.js";
import { RequestDto } from "../../../../../clients/access-management/service-owner/request/request.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves sent requests for a party.
 *
 * @param {RequestClient} requestClient Client for the Access Management Request API.
 * @param {SentRequestsQuery|null} [queryParams]
 * Query parameters. Use {@link SentRequestsQueryBuilder}.
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
        console.log(res.status);
        console.log(res.body);
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
