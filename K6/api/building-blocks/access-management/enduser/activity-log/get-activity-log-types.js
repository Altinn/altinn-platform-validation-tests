import { check } from "k6";

import { ActivityTypeDto } from "../../../../../clients/access-management/enduser/activity-log/activity-log.types.js";
import { ActivityLogClient } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { sentTraceparent, withRetries } from "../../../common/retry.js";

/**
 * Retrieves the activity types the activity log can hold.
 *
 * @param {ActivityLogClient} activityLogClient Client for the activity log of one area.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {Array<ActivityTypeDto>|null} The parsed response body, or null when the call failed.
 */
export function GetActivityLogTypes(
    activityLogClient,
    labels = null,
) {
    const res = withRetries(
        () => activityLogClient.GetActivityLogTypes(labels),
        "GetActivityLogTypes",
    );

    /** @type {Array<ActivityTypeDto>|null} */
    let body = null;

    const succeed = check(res, {
        "GetActivityLogTypes - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        const traceparent = sentTraceparent(res);
        console.log(`GetActivityLogTypes - status ${res.status}${traceparent ? `, traceparent ${traceparent}` : ""}`);
        console.log(res.body);
        return body;
    }

    check(res, {
        "GetActivityLogTypes - body is valid": (r) => {
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
