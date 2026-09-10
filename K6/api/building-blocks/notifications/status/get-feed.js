
import { check } from "k6";

import { StatusClient } from "../../../../clients/notifications/status/index.js";
import { StatusFeedExt, StatusFeedQuery } from "../../../../clients/notifications/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves an array of order status change history.
 *
 * @param {StatusClient} statusClient Client for the Status API.
 * @param {StatusFeedQuery|null} queryParams Optional status feed query parameters.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {StatusFeedExt[]|null} Status feed entries.
 */
export function StatusGetFeed(
    statusClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => statusClient.StatusGetFeed(queryParams, labels),
        "StatusGetFeed",
    );

    /** @type {StatusFeedExt[]|null} */
    let statusFeed = null;

    const succeed = check(res, {
        "StatusGetFeed - status code is 200": (r) =>
            r.status === 200,
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
