import { check } from "k6";

import { OrganizationsClient } from "../../../../clients/profil/organizations/index.js";
import { NotificationAddressResponse } from "../../../../clients/profil/organizations/organizations.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes a notification address for an organization.
 *
 * @param {OrganizationsClient} organizationsClient Client for the Organizations API.
 * @param {string} organizationNumber Organization number.
 * @param {number} notificationAddressId Notification address identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {NotificationAddressResponse|null} Deleted notification address.
 */
export function DeleteNotificationAddress(
    organizationsClient,
    organizationNumber,
    notificationAddressId,
    labels = null,
) {
    const res = withRetries(
        () => organizationsClient.DeleteNotificationAddress(
            organizationNumber,
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
