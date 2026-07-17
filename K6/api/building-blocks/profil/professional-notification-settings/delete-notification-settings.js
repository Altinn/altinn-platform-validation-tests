import { check } from "k6";

import { ProfessionalNotificationSettingsClient } from "../../../../clients/professional-notification-settings/index.js";

/**
 * Deletes notification settings for a party.
 *
 * @param {ProfessionalNotificationSettingsClient} professionalNotificationSettingsClient
 * Client for the Professional Notification Settings API.
 * @param {string} partyUuid Party UUID.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {NotificationSettingsResponse|null}
 */
export function DeleteNotificationSettings(
    professionalNotificationSettingsClient,
    partyUuid,
    labels = null,
) {
    const res =
        professionalNotificationSettingsClient.DeleteNotificationSettings(
            partyUuid,
            labels,
        );

    /** @type {NotificationSettingsResponse|null} */
    let settings = null;

    const succeed = check(res, {
        "DeleteNotificationSettings - status code is 200": (r) =>
            r.status === 200,
        "DeleteNotificationSettings - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return settings;
    }

    check(res, {
        "DeleteNotificationSettings - body is valid": (r) => {
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
