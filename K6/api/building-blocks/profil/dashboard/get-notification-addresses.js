import { check } from "k6";

import { DashboardClient } from "../../../../clients/dashboard/index.js";

/**
 * Gets all notification addresses for the given organization.
 *
 * @param {DashboardClient} dashboardClient Client for the Dashboard API.
 * @param {string} organizationNumber Organization number.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<DashboardNotificationAddressResponse>} Notification addresses for the organization.
 */
export function GetNotificationAddresses(
    dashboardClient,
    organizationNumber,
    labels = null,
) {
    const res = dashboardClient.GetNotificationAddresses(
        organizationNumber,
        labels,
    );

    /** @type {Array<DashboardNotificationAddressResponse>} */
    let notificationAddresses = [];

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
