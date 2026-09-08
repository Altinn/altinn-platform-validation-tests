import { check } from "k6";

import { NotificationAddressModel } from "../../../../clients/access-management-bff/common/common.types.js";
import { SettingsClient } from "../../../../clients/access-management-bff/settings/index.js";
import { NotificationAddressResponse } from "../../../../clients/profil/organizations/organizations.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Adds a notification address to an organisation.
 *
 * @param {SettingsClient} settingsClient Client for the settings endpoints.
 * @param {string} orgNumber Organisation number.
 * @param {NotificationAddressModel|null} [body] The notification address to
 * add. Use {@link NotificationAddressModelBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {NotificationAddressResponse|null} The created notification
 * address.
 */
export function CreateNotificationAddress(
    settingsClient,
    orgNumber,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => settingsClient.CreateNotificationAddress(
            orgNumber,
            body,
            labels,
        ),
        "CreateNotificationAddress",
    );

    /** @type {NotificationAddressResponse|null} */
    let notificationAddress = null;

    const succeed = check(res, {
        "CreateNotificationAddress - status code is 200": (r) =>
            r.status === 200,
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
