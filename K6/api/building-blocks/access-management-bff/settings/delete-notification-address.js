import { check } from "k6";

import { SettingsClient } from "../../../../clients/access-management-bff/settings/index.js";
import { NotificationAddressResponse } from "../../../../clients/profil/organizations/organizations.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes a notification address from an organisation.
 *
 * @param {SettingsClient} settingsClient Client for the settings endpoints.
 * @param {string} orgNumber Organisation number.
 * @param {number} notificationAddressId Notification address id.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {NotificationAddressResponse|null} The removed notification
 * address.
 */
export function DeleteNotificationAddress(
    settingsClient,
    orgNumber,
    notificationAddressId,
    labels = null,
) {
    const res = withRetries(
        () => settingsClient.DeleteNotificationAddress(
            orgNumber,
            notificationAddressId,
            labels,
        ),
        "DeleteNotificationAddress",
    );

    /** @type {NotificationAddressResponse|null} */
    let notificationAddress = null;

    const succeed = check(res, {
        "DeleteNotificationAddress - status code is 200": (r) =>
            r.status === 200,
        "DeleteNotificationAddress - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationAddress;
    }

    check(res, {
        "DeleteNotificationAddress - body is valid": (r) => {
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
