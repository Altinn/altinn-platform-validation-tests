import { check } from "k6";

import { ServiceOwnerApiClient } from "../../../../clients/dialogporten/serviceowner/index.js";
import { V1ServiceOwnerDialogsQueriesNotificationCondition_NotificationCondition } from "../../../../clients/dialogporten/serviceowner/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * @param {ServiceOwnerApiClient} serviceOwnerApiClient TODO: description
 * @param { string } dialogId TODO: description
 * @param { string } conditionType TODO: description
 * @param { string } activityType TODO: description
 * @param { string } transmissionId TODO: description
 * @param {{[x: string]: string}} labels - Object containing request labels as key/value pairs.
 * @returns {V1ServiceOwnerDialogsQueriesNotificationCondition_NotificationCondition|null} Parsed response body, or null when the call failed.
 */
export function GetDialogsQueriesNotificationCondition(
    serviceOwnerApiClient,
    dialogId,
    conditionType,
    activityType,
    transmissionId,
    labels = null
) {
    const res = withRetries(
        () => serviceOwnerApiClient.GetDialogsQueriesNotificationCondition(
            dialogId,
            conditionType,
            activityType,
            transmissionId,
            labels
        ),
        "GetDialogsQueriesNotificationCondition",
    );

    /** @type {V1ServiceOwnerDialogsQueriesNotificationCondition_NotificationCondition|null} */
    let notificationCondition = null;

    const success = check(res, {
        "GetDialogsQueriesNotificationCondition - status code MUST be 200": (res) => res.status == 200,
    });

    if (!success) {
        console.log(res.status);
        console.log(res.body);

        return notificationCondition;
    }

    check(res, {
        "GetDialogsQueriesNotificationCondition - body is not empty": (r) => {
            try {
                notificationCondition = JSON.parse(r.body);

                return notificationCondition !== null && notificationCondition !== undefined;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return notificationCondition;
}
