import { check } from "k6";

import { NotificationLogClient } from "../../../../clients/notifications/notification-log/index.js";
import { NotificationLogSummaryExt } from "../../../../clients/notifications/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves the end user's own notification log entries for a dialog.
 *
 * @param {NotificationLogClient} notificationLogClient Client for the Notification Log API.
 * @param {string} dialogId Dialogporten dialog identifier.
 * @param {string|null} [transmissionId] Optional Dialogporten transmission identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {NotificationLogSummaryExt[]|null} Notification log entries.
 */
export function NotificationLogGetEndUser(
    notificationLogClient,
    dialogId,
    transmissionId = null,
    labels = null,
) {
    const res = withRetries(
        () => notificationLogClient.NotificationLogGetEndUser(
            dialogId,
            transmissionId,
            labels,
        ),
        "NotificationLogGetEndUser",
    );

    /** @type {NotificationLogSummaryExt[]|null} */
    let logEntries = null;

    const succeed = check(res, {
        "NotificationLogGetEndUser - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return logEntries;
    }

    check(res, {
        "NotificationLogGetEndUser - body is valid": (r) => {
            try {
                logEntries = JSON.parse(r.body);

                return Array.isArray(logEntries);
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return logEntries;
}
