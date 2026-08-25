import { check } from "k6";

import { SettingsClient } from "../../../../clients/access-management-bff/settings/index.js";
import { NotificationAddressResponse } from "../../../../clients/profil/organizations/organizations.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the notification addresses of an organisation.
 *
 * @param {SettingsClient} settingsClient Client for the settings endpoints.
 * @param {string} orgNumber Organisation number.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<NotificationAddressResponse>|null} The notification
 * addresses.
 */
export function GetNotificationAddresses(
    settingsClient,
    orgNumber,
    labels = null,
) {
    const res = withRetries(
        () => settingsClient.GetNotificationAddresses(orgNumber, labels),
        "GetNotificationAddresses",
    );

    /** @type {Array<NotificationAddressResponse>|null} */
    let notificationAddresses = null;

    const succeed = check(res, {
        "GetNotificationAddresses - status code is 200": (r) =>
            r.status === 200,
        "GetNotificationAddresses - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationAddresses;
    }

    check(res, {
        "GetNotificationAddresses - body is valid": (r) => {
            try {
                notificationAddresses = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return notificationAddresses;
}
