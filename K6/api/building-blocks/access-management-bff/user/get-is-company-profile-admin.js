import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Checks whether the authenticated user is a company profile administrator.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {string} party Party UUID of the reportee.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean|null} True if the user is a company profile administrator.
 */
export function GetIsCompanyProfileAdmin(userClient, party, labels = null) {
    const res = withRetries(
        () => userClient.GetIsCompanyProfileAdmin(party, labels),
        "GetIsCompanyProfileAdmin",
    );

    /** @type {boolean|null} */
    let isCompanyProfileAdmin = null;

    const succeed = check(res, {
        "GetIsCompanyProfileAdmin - status code is 200": (r) =>
            r.status === 200,
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
