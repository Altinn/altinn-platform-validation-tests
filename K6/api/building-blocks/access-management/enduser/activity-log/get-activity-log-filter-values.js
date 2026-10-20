import { check } from "k6";

import { ActivityLogFilterField, ActivityLogFilterValueDtoPaginatedResult, ActivityLogFilterValuesQuery } from "../../../../../clients/access-management/enduser/activity-log/activity-log.types.js";
import { ActivityLogClient } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves the values a field of the activity log can be filtered on.
 *
 * @param {ActivityLogClient} activityLogClient Client for the activity log of one area.
 * @param {ActivityLogFilterField} field The field to list values for.
 * @param {ActivityLogFilterValuesQuery} query
 * Query parameters. Use {@link ActivityLogQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {ActivityLogFilterValueDtoPaginatedResult|null} The parsed response body, or null when the call failed.
 */
export function GetActivityLogFilterValues(
    activityLogClient,
    field,
    query,
    labels = null,
) {
    const res = withRetries(
        () => activityLogClient.GetActivityLogFilterValues(field, query, labels),
        "GetActivityLogFilterValues",
    );

    /** @type {ActivityLogFilterValueDtoPaginatedResult|null} */
    let body = null;

    const succeed = check(res, {
        "GetActivityLogFilterValues - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return body;
    }

    check(res, {
        "GetActivityLogFilterValues - body is valid": (r) => {
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
