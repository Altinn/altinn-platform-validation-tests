import { check } from "k6";

import { DashboardNotificationAddressResponse } from "../../../../clients/profil/dashboard/dashboard.types.js";
import { DashboardClient } from "../../../../clients/profil/dashboard/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets all notification addresses for the given organization.
 *
 * @param {DashboardClient} dashboardClient Client for the Dashboard API.
 * @param {string} organizationNumber Organization number.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<DashboardNotificationAddressResponse>} Notification addresses for the organization.
 */
export function GetNotificationAddresses(
    dashboardClient,
    organizationNumber,
    labels = null,
) {
    const res = withRetries(
        () => dashboardClient.GetNotificationAddresses(
            organizationNumber,
            labels,
        ),
        "GetNotificationAddresses",
    );

    /** @type {Array<DashboardNotificationAddressResponse>} */
    let notificationAddresses = [];

    const succeed = check(res, {
        "GetNotificationAddresses - status code is 200": (r) =>
            r.status === 200,
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
