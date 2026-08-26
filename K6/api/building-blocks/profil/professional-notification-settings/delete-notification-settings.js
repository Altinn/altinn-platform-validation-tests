import { check } from "k6";

import { ProfessionalNotificationSettingsClient } from "../../../../clients/profil/professional-notification-settings/index.js";
import { NotificationSettingsResponse } from "../../../../clients/profil/professional-notification-settings/professional-notification-settings.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes notification settings for a party.
 *
 * The endpoint is declared as returning the settings it deleted, but it answers
 * `Ok()` with nothing in it, so there is no body to read: a 200 is the whole
 * answer. Verified against ProfessionalNotificationSettingsController.Delete in
 * altinn-profile.
 *
 * @param {ProfessionalNotificationSettingsClient} professionalNotificationSettingsClient
 * Client for the Professional Notification Settings API.
 * @param {string} partyUuid Party UUID.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {boolean} True if the settings were deleted.
 */
export function DeleteNotificationSettings(
    professionalNotificationSettingsClient,
    partyUuid,
    labels = null,
) {
    const res = withRetries(
        () => professionalNotificationSettingsClient.DeleteNotificationSettings(
            partyUuid,
            labels,
        ),
        "DeleteNotificationSettings",
    );

    const succeed = check(res, {
        "DeleteNotificationSettings - status code is 200": (r) =>
            r.status === 200,
        "DeleteNotificationSettings - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    return true;
}
