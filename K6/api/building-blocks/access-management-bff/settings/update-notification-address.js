import { check } from "k6";

import { SettingsClient } from "../../../../../clients/access-management-bff/settings/index.js";

/**
 * Updates a notification address of an organisation.
 *
 * @param {SettingsClient} settingsClient Client for the settings endpoints.
 * @param {string} orgNumber Organisation number.
 * @param {number} notificationAddressId Notification address id.
 * @param {NotificationAddressModel|null} [body] The new notification address
 * values. Use {@link NotificationAddressModelBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {NotificationAddressResponse|null} The updated notification
 * address.
 */
export function UpdateNotificationAddress(
    settingsClient,
    orgNumber,
    notificationAddressId,
    body = null,
    labels = null,
) {
    const res = settingsClient.UpdateNotificationAddress(
        orgNumber,
        notificationAddressId,
        body,
        labels,
    );

    /** @type {NotificationAddressResponse|null} */
    let notificationAddress = null;

    const succeed = check(res, {
        "UpdateNotificationAddress - status code is 200": (r) =>
            r.status === 200,
        "UpdateNotificationAddress - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationAddress;
    }

    check(res, {
        "UpdateNotificationAddress - body is valid": (r) => {
            try {
                notificationAddress = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return notificationAddress;
}
