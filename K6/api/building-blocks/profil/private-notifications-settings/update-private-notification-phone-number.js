import { check } from "k6";

import { PrivateNotificationsSettingsClient } from "../../../../clients/profil/private-notifications-settings/index.js";
import { PrivateNotificationSettingsUpdateRequest, PrivateNotificationSettingsUpdateResponse } from "../../../../clients/profil/private-notifications-settings/private-notifications-settings.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Updates the private notification phone number for the current user.
 *
 * @param {PrivateNotificationsSettingsClient} privateNotificationsSettingsClient
 * Client for the Private Notifications Settings API.
 * @param {PrivateNotificationSettingsUpdateRequest} request
 * Request body. Use {@link PrivateNotificationSettingsUpdateRequestBuilder}.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {PrivateNotificationSettingsUpdateResponse|null} Parsed response body, or null when the call failed.
 */
export function UpdatePrivateNotificationPhoneNumber(
    privateNotificationsSettingsClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => privateNotificationsSettingsClient.UpdatePrivateNotificationPhoneNumber(
            request,
            labels,
        ),
        "UpdatePrivateNotificationPhoneNumber",
    );

    /** @type {PrivateNotificationSettingsUpdateResponse|null} */
    let response = null;

    const succeed = check(res, {
        "UpdatePrivateNotificationPhoneNumber - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return response;
    }

    check(res, {
        "UpdatePrivateNotificationPhoneNumber - body is valid": (r) => {
            try {
                response = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return response;
}
