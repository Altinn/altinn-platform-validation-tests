import { check } from "k6";

import { ProfessionalNotificationSettingsClient } from "../../../../clients/profil/professional-notification-settings/index.js";
import { NotificationSettingsResponse } from "../../../../clients/profil/professional-notification-settings/professional-notification-settings.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets notification settings for all parties.
 *
 * @param {ProfessionalNotificationSettingsClient} professionalNotificationSettingsClient
 * Client for the Professional Notification Settings API.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {Array<NotificationSettingsResponse>|null} Parsed response body, or null when the call failed.
 */
export function GetAllNotificationSettings(
    professionalNotificationSettingsClient,
    labels = null,
) {
    const res = withRetries(
        () => professionalNotificationSettingsClient.GetAllNotificationSettings(
            labels,
        ),
        "GetAllNotificationSettings",
    );

    /** @type {Array<NotificationSettingsResponse>|null} */
    let settings = null;

    const succeed = check(res, {
        "GetAllNotificationSettings - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return settings;
    }

    check(res, {
        "GetAllNotificationSettings - body is valid": (r) => {
            try {
                settings = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return settings;
}
