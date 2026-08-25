import { check } from "k6";

import { DashboardUserContactInformationResponse } from "../../../../clients/profil/dashboard-user-contact-information/dashboard-user-contact-information.types.js";
import { DashboardUserContactInformationClient } from "../../../../clients/profil/dashboard-user-contact-information/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets all user contact information for the given phone number.
 *
 * @param {DashboardUserContactInformationClient} dashboardUserContactInformationClient Client for the Dashboard User Contact Information API.
 * @param {string} phoneNumber Phone number.
 * @param {{countrycode?: string}|null} [query]
 * Optional query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<DashboardUserContactInformationResponse>} User contact information for the phone number.
 */
export function GetContactInformationByPhoneNumber(
    dashboardUserContactInformationClient,
    phoneNumber,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => dashboardUserContactInformationClient.GetContactInformationByPhoneNumber(
            phoneNumber,
            query,
            labels,
        ),
        "GetContactInformationByPhoneNumber",
    );

    /** @type {Array<DashboardUserContactInformationResponse>} */
    let contactInformation = [];

    const succeed = check(res, {
        "GetContactInformationByPhoneNumber - status code is 200": (r) =>
            r.status === 200,
        "GetContactInformationByPhoneNumber - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return contactInformation;
    }

    check(res, {
        "GetContactInformationByPhoneNumber - body is valid": (r) => {
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
