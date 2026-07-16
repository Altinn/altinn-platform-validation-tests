import { check } from "k6";

import { DashboardClient } from "../../../../clients/dashboard/index.js";

/**
 * Gets all notification addresses for the given phone number.
 *
 * @param {DashboardClient} dashboardClient Client for the Dashboard API.
 * @param {string} phoneNumber Phone number.
 * @param {{countrycode?: string}|null} [query]
 * Optional query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<DashboardNotificationAddressResponse>} Notification addresses for the phone number.
 */
export function GetNotificationAddressesByPhoneNumber(
    dashboardClient,
    phoneNumber,
    query = null,
    labels = null,
) {
    const res = dashboardClient.GetNotificationAddressesByPhoneNumber(
        phoneNumber,
        query,
        labels,
    );

    /** @type {Array<DashboardNotificationAddressResponse>} */
    let notificationAddresses = [];

    const succeed = check(res, {
        "GetNotificationAddressesByPhoneNumber - status code is 200": (r) =>
            r.status === 200,
        "GetNotificationAddressesByPhoneNumber - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return notificationAddresses;
    }

    check(res, {
        "GetNotificationAddressesByPhoneNumber - body is valid": (r) => {
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
