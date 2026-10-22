import { check } from "k6";

import { ActivityLogFilterField } from "../../../../../clients/access-management/enduser/activity-log/activity-log.types.js";
import { ActivityLogClient } from "../../../../../clients/access-management/enduser/activity-log/index.js";
import { sentTraceparent, withRetries } from "../../../common/retry.js";

/**
 * Retrieves the fields the activity log can be filtered on.
 *
 * @param {ActivityLogClient} activityLogClient Client for the activity log of one area.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {Array<ActivityLogFilterField>|null} The parsed response body, or null when the call failed.
 */
export function GetActivityLogFilterFields(
    activityLogClient,
    labels = null,
) {
    const res = withRetries(
        () => activityLogClient.GetActivityLogFilterFields(labels),
        "GetActivityLogFilterFields",
    );

    /** @type {Array<ActivityLogFilterField>|null} */
    let body = null;

    const succeed = check(res, {
        "GetActivityLogFilterFields - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        const traceparent = sentTraceparent(res);
        console.log(`GetActivityLogFilterFields - status ${res.status}${traceparent ? `, traceparent ${traceparent}` : ""}`);
        console.log(res.body);
        return body;
    }

    check(res, {
        "GetActivityLogFilterFields - body is valid": (r) => {
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
