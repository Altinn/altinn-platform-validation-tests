import { check } from "k6";

import { SettingsClient } from "../../../../../clients/access-management-bff/settings/index.js";

/**
 * Adds a notification address to an organisation.
 *
 * @param {SettingsClient} settingsClient Client for the settings endpoints.
 * @param {string} orgNumber Organisation number.
 * @param {NotificationAddressModel|null} [body] The notification address to
 * add. Use {@link NotificationAddressModelBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {NotificationAddressResponse|null} The created notification
 * address.
 */
export function CreateNotificationAddress(
    settingsClient,
    orgNumber,
    body = null,
    labels = null,
) {
    const res = settingsClient.CreateNotificationAddress(
        orgNumber,
        body,
        labels,
    );

    /** @type {NotificationAddressResponse|null} */
    let notificationAddress = null;

    const succeed = check(res, {
        "CreateNotificationAddress - status code is 200": (r) =>
            r.status === 200,
        "CreateNotificationAddress - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationAddress;
    }

    check(res, {
        "CreateNotificationAddress - body is valid": (r) => {
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
