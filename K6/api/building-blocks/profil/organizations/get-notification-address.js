import { check } from "k6";

import { OrganizationsClient } from "../../../../clients/organizations/index.js";

/**
 * Gets a notification address for an organization.
 *
 * @param {OrganizationsClient} organizationsClient Client for the Organizations API.
 * @param {string} organizationNumber Organization number.
 * @param {number} notificationAddressId Notification address identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {NotificationAddressResponse|null} Notification address.
 */
export function GetNotificationAddress(
    organizationsClient,
    organizationNumber,
    notificationAddressId,
    labels = null,
) {
    const res = organizationsClient.GetNotificationAddress(
        organizationNumber,
        notificationAddressId,
        labels,
    );

    /** @type {NotificationAddressResponse|null} */
    let notificationAddress = null;

    const succeed = check(res, {
        "GetNotificationAddress - status code is 200": (r) =>
            r.status === 200,
        "GetNotificationAddress - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationAddress;
    }

    check(res, {
        "GetNotificationAddress - body is valid": (r) => {
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
