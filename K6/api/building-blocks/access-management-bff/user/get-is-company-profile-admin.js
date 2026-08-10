import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";

/**
 * Checks whether the authenticated user is a company profile administrator.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {string} party Party UUID of the reportee.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean|null} True if the user is a company profile administrator.
 */
export function GetIsCompanyProfileAdmin(userClient, party, labels = null) {
    const res = userClient.GetIsCompanyProfileAdmin(party, labels);

    /** @type {boolean|null} */
    let isCompanyProfileAdmin = null;

    const succeed = check(res, {
        "GetIsCompanyProfileAdmin - status code is 200": (r) =>
            r.status === 200,
        "GetIsCompanyProfileAdmin - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return isCompanyProfileAdmin;
    }

    check(res, {
        "GetIsCompanyProfileAdmin - body is valid": (r) => {
            try {
                isCompanyProfileAdmin = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return isCompanyProfileAdmin;
}
