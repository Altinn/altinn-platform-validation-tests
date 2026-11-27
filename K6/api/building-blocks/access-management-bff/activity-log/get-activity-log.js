import { check } from "k6";

import { GetActivityLogQuery } from "../../../../clients/access-management-bff/activity-log/activity-log.types.js";
import { ActivityLogClient } from "../../../../clients/access-management-bff/activity-log/index.js";
import { PaginatedResultOfActivityLogDto } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the activity log of a party in an area.
 *
 * @param {ActivityLogClient} activityLogClient Client for the activity log
 * endpoints.
 * @param {string} area The area to get the activity log for.
 * @param {GetActivityLogQuery} queryParams Query parameters. Use
 * {@link GetActivityLogQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {PaginatedResultOfActivityLogDto|null} A page of the activity log.
 */
export function GetActivityLog(
    activityLogClient,
    area,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => activityLogClient.GetActivityLog(area, queryParams, labels),
        "GetActivityLog",
    );

    /** @type {PaginatedResultOfActivityLogDto|null} */
    let activityLog = null;

    const succeed = check(res, {
        "GetActivityLog - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return activityLog;
    }

    check(res, {
        "GetActivityLog - body is valid": (r) => {
            try {
                activityLog = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return activityLog;
}
