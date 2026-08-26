import { check } from "k6";

import { DashboardNotificationAddressResponse } from "../../../../clients/profil/dashboard/dashboard.types.js";
import { DashboardClient } from "../../../../clients/profil/dashboard/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets all notification addresses for the given email address.
 *
 * @param {DashboardClient} dashboardClient Client for the Dashboard API.
 * @param {string} emailAddress Email address.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<DashboardNotificationAddressResponse>} Notification addresses for the email address.
 */
export function GetNotificationAddressesByEmail(
    dashboardClient,
    emailAddress,
    labels = null,
) {
    const res = withRetries(
        () => dashboardClient.GetNotificationAddressesByEmail(
            emailAddress,
            labels,
        ),
        "GetNotificationAddressesByEmail",
    );

    /** @type {Array<DashboardNotificationAddressResponse>} */
    let notificationAddresses = [];

    const succeed = check(res, {
        "GetNotificationAddressesByEmail - status code is 200": (r) =>
            r.status === 200,
        "GetNotificationAddressesByEmail - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationAddresses;
    }

    check(res, {
        "GetNotificationAddressesByEmail - body is valid": (r) => {
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
