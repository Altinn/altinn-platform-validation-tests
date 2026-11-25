import { check } from "k6";

import { ProfessionalNotificationSettingsClient } from "../../../../clients/profil/professional-notification-settings/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes notification settings for a party.
 *
 * The API answers 200 with an empty body.
 *
 * @param {ProfessionalNotificationSettingsClient} professionalNotificationSettingsClient
 * Client for the Professional Notification Settings API.
 * @param {string} partyUuid Party UUID.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {boolean} Whether the settings were deleted.
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
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
    }

    return succeed;
}
