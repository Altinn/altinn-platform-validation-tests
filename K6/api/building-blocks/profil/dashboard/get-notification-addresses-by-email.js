import { check } from "k6";

import { DashboardClient } from "../../../../clients/dashboard/index.js";

/**
 * Gets all notification addresses for the given email address.
 *
 * @param {DashboardClient} dashboardClient Client for the Dashboard API.
 * @param {string} emailAddress Email address.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<DashboardNotificationAddressResponse>} Notification addresses for the email address.
 */
export function GetNotificationAddressesByEmail(
    dashboardClient,
    emailAddress,
    labels = null,
) {
    const res = dashboardClient.GetNotificationAddressesByEmail(
        emailAddress,
        labels,
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
