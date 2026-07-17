import { check } from "k6";

import { ProfessionalNotificationSettingsClient } from "../../../../clients/professional-notification-settings/index.js";

/**
 * Creates or updates notification settings for a party.
 *
 * @param {ProfessionalNotificationSettingsClient} professionalNotificationSettingsClient
 * Client for the Professional Notification Settings API.
 * @param {string} partyUuid Party UUID.
 * @param {NotificationSettingsRequest} request
 * Request body.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {boolean}
 */
export function CreateOrUpdateNotificationSettings(
    professionalNotificationSettingsClient,
    partyUuid,
    request,
    labels = null,
) {
    const res =
        professionalNotificationSettingsClient.CreateOrUpdateNotificationSettings(
            partyUuid,
            request,
            labels,
        );

    const succeed = check(res, {
        "CreateOrUpdateNotificationSettings - status code is 201 or 204": (
            r,
        ) => r.status === 201 || r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    return true;
}
