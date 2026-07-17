import { check } from "k6";

import { OrganizationsClient } from "../../../../clients/organizations/index.js";

/**
 * Updates a notification address for an organization.
 *
 * @param {OrganizationsClient} organizationsClient Client for the Organizations API.
 * @param {string} organizationNumber Organization number.
 * @param {number} notificationAddressId Notification address identifier.
 * @param {NotificationAddressRequest} request Notification address request.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {NotificationAddressResponse|null} Updated notification address.
 */
export function UpdateNotificationAddress(
    organizationsClient,
    organizationNumber,
    notificationAddressId,
    request,
    labels = null,
) {
    const res = organizationsClient.UpdateNotificationAddress(
        organizationNumber,
        notificationAddressId,
        request,
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
