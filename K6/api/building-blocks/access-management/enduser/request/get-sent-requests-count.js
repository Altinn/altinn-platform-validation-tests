import { check } from "k6";

import { RequestClient } from "../../../../../clients/access-management/enduser/request/index.js";

/**
 * Retrieves count of sent requests for a party.
 *
 * @param {RequestClient} requestClient Client for the Access Management Request API.
 * @param {SentRequestsQuery|null} [queryParams]
 * Query parameters. Use {@link SentRequestsQueryBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {number} Number of sent requests.
 */
export function GetSentRequestsCount(
    requestClient,
    queryParams = null,
    labels = null,
) {
    const res = requestClient.GetSentRequestsCount(
        queryParams,
        labels,
    );

    /** @type {number} */
    let count = 0;

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
