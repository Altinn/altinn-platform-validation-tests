import { check } from "k6";

import { GetActivityLogFilterValuesQuery } from "../../../../clients/access-management-bff/activity-log/activity-log.types.js";
import { ActivityLogClient } from "../../../../clients/access-management-bff/activity-log/index.js";
import { PaginatedResultOfActivityLogFilterValueDto } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the values a field of the activity log can be filtered on.
 *
 * @param {ActivityLogClient} activityLogClient Client for the activity log
 * endpoints.
 * @param {string} area The area to get the filter values for.
 * @param {string} field The field to get the filter values for.
 * @param {GetActivityLogFilterValuesQuery} queryParams Query parameters. Use
 * {@link GetActivityLogFilterValuesQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {PaginatedResultOfActivityLogFilterValueDto|null} A page of filter values.
 */
export function GetActivityLogFilterValues(
    activityLogClient,
    area,
    field,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => activityLogClient.GetActivityLogFilterValues(area, field, queryParams, labels),
        "GetActivityLogFilterValues",
    );

    /** @type {PaginatedResultOfActivityLogFilterValueDto|null} */
    let filterValues = null;

    const succeed = check(res, {
        "GetActivityLogFilterValues - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return filterValues;
    }

    check(res, {
        "GetActivityLogFilterValues - body is valid": (r) => {
            try {
                filterValues = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return filterValues;
}
