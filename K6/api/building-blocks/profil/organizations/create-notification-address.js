import { check } from "k6";

import { OrganizationsClient } from "../../../../clients/organizations/index.js";

/**
 * Creates a notification address for an organization.
 *
 * @param {OrganizationsClient} organizationsClient Client for the Organizations API.
 * @param {string} organizationNumber Organization number.
 * @param {NotificationAddressRequest} request Notification address request.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {NotificationAddressResponse|null} Created notification address.
 */
export function CreateNotificationAddress(
    organizationsClient,
    organizationNumber,
    request,
    labels = null,
) {
    const res = organizationsClient.CreateNotificationAddress(
        organizationNumber,
        request,
        labels,
    );

    /** @type {NotificationAddressResponse|null} */
    let notificationAddress = null;

    const succeed = check(res, {
        "CreateNotificationAddress - status code is 200 or 201": (r) =>
            r.status === 200 || r.status === 201,
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
