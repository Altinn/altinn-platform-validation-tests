import { check } from "k6";

import { OrganizationsClient } from "../../../../clients/organizations/index.js";

/**
 * Gets notification addresses for an organization.
 *
 * @param {OrganizationsClient} organizationsClient Client for the Organizations API.
 * @param {string} organizationNumber Organization number.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {OrganizationResponse|null} Organization notification addresses.
 */
export function GetNotificationAddresses(
    organizationsClient,
    organizationNumber,
    labels = null,
) {
    const res = organizationsClient.GetNotificationAddresses(
        organizationNumber,
        labels,
    );

    /** @type {OrganizationResponse|null} */
    let organization = null;

    const succeed = check(res, {
        "GetNotificationAddresses - status code is 200": (r) =>
            r.status === 200,
        "GetNotificationAddresses - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return organization;
    }

    check(res, {
        "GetNotificationAddresses - body is valid": (r) => {
            try {
                organization = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return organization;
}
