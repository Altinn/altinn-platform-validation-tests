import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";

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
 * @param {{[key: string]: string}} [labels]
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
    const res = requestClient.GetSentRequests(
        queryParams,
        pageSize,
        pageNumber,
        labels,
    );

    /** @type {Array<RequestDto>} */
    let requests = [];

    const succeed = check(res, {
        "GetSentRequests - status code is 200": (r) =>
            r.status === 200,
        "GetSentRequests - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
