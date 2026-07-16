import { check } from "k6";

import { DashboardUserContactInformationClient } from "../../../../clients/dashboard-user-contact-information/index.js";

/**
 * Gets all user contact information for the given email address.
 *
 * @param {DashboardUserContactInformationClient} dashboardUserContactInformationClient Client for the Dashboard User Contact Information API.
 * @param {string} emailAddress Email address.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<DashboardUserContactInformationResponse>} User contact information for the email address.
 */
export function GetContactInformationByEmail(
    dashboardUserContactInformationClient,
    emailAddress,
    labels = null,
) {
    const res =
        dashboardUserContactInformationClient.GetContactInformationByEmail(
            emailAddress,
            labels,
        );

    /** @type {Array<DashboardUserContactInformationResponse>} */
    let contactInformation = [];

    const succeed = check(res, {
        "GetContactInformationByEmail - status code is 200": (r) =>
            r.status === 200,
        "GetContactInformationByEmail - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return contactInformation;
    }

    check(res, {
        "GetContactInformationByEmail - body is valid": (r) => {
            try {
                contactInformation = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return contactInformation;
}
