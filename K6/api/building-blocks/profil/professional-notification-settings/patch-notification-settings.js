import { check } from "k6";

import { ProfessionalNotificationSettingsClient } from "../../../../clients/profil/professional-notification-settings/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Partially updates notification settings for a party.
 *
 * @param {ProfessionalNotificationSettingsClient} professionalNotificationSettingsClient
 * Client for the Professional Notification Settings API.
 * @param {string} partyUuid Party UUID.
 * @param {NotificationSettingsPatchRequest} request
 * Request body.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {boolean} Parsed response body, or null when the call failed.
 */
export function PatchNotificationSettings(
    professionalNotificationSettingsClient,
    partyUuid,
    request,
    labels = null,
) {
    const res = withRetries(
        () => professionalNotificationSettingsClient.PatchNotificationSettings(
            partyUuid,
            request,
            labels,
        ),
        "PatchNotificationSettings",
    );

    const succeed = check(res, {
        "PatchNotificationSettings - status code is 201 or 204": (r) =>
            r.status === 201 || r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    return true;
}
