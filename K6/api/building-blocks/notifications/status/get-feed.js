
import { check } from "k6";

import { StatusClient } from "../../../../clients/status/index.js";

/**
 * Retrieves an array of order status change history.
 *
 * @param {StatusClient} statusClient Client for the Status API.
 * @param {StatusFeedQuery|null} queryParams Optional status feed query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {StatusFeedExt[]|null} Status feed entries.
 */
export function StatusGetFeed(
    statusClient,
    queryParams = null,
    labels = null,
) {
    const res = statusClient.StatusGetFeed(queryParams, labels);

    /** @type {StatusFeedExt[]|null} */
    let statusFeed = null;

    const succeed = check(res, {
        "StatusGetFeed - status code is 200": (r) =>
            r.status === 200,
        "StatusGetFeed - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return statusFeed;
    }

    check(res, {
        "StatusGetFeed - body is valid": (r) => {
            try {
                statusFeed = JSON.parse(r.body);

                return Array.isArray(statusFeed);
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return statusFeed;
}
