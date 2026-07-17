import { check } from "k6";

import { PrivateNotificationsSettingsClient } from "../../../../clients/private-notifications-settings/index.js";

/**
 * Updates the private notification phone number for the current user.
 *
 * @param {PrivateNotificationsSettingsClient} privateNotificationsSettingsClient
 * Client for the Private Notifications Settings API.
 * @param {PrivateNotificationSettingsUpdateRequest} request
 * Request body. Use {@link PrivateNotificationSettingsUpdateRequestBuilder}.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {PrivateNotificationSettingsUpdateResponse|null}
 */
export function UpdatePrivateNotificationPhoneNumber(
    privateNotificationsSettingsClient,
    request,
    labels = null,
) {
    const res =
        privateNotificationsSettingsClient.UpdatePrivateNotificationPhoneNumber(
            request,
            labels,
        );

    /** @type {PrivateNotificationSettingsUpdateResponse|null} */
    let response = null;

    const succeed = check(res, {
        "UpdatePrivateNotificationPhoneNumber - status code is 200": (r) =>
            r.status === 200,
        "UpdatePrivateNotificationPhoneNumber - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
