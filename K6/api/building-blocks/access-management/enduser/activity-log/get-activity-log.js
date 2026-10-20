import { check } from "k6";

import { ActivityLogDtoPaginatedResult, ActivityLogQuery } from "../../../../../clients/access-management/enduser/activity-log/activity-log.types.js";
import { ActivityLogClient } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { sentTraceparent, withRetries } from "../../../common/retry.js";

/**
 * Retrieves a page of the activity log of a party.
 *
 * @param {ActivityLogClient} activityLogClient Client for the activity log of one area.
 * @param {ActivityLogQuery} query
 * Query parameters. Use {@link ActivityLogQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {ActivityLogDtoPaginatedResult|null} The parsed response body, or null when the call failed.
 */
export function GetActivityLog(
    activityLogClient,
    query,
    labels = null,
) {
    const res = withRetries(
        () => activityLogClient.GetActivityLog(query, labels),
        "GetActivityLog",
    );

    /** @type {ActivityLogDtoPaginatedResult|null} */
    let body = null;

    const succeed = check(res, {
        "GetActivityLog - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        const traceparent = sentTraceparent(res);
        console.log(`GetActivityLog - status ${res.status}${traceparent ? `, traceparent ${traceparent}` : ""}`);
        console.log(res.body);
        return body;
    }

    check(res, {
        "GetActivityLog - body is valid": (r) => {
            try {
                body = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return body;
}
