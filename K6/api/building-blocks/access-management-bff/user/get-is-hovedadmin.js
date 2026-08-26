import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Checks whether the authenticated user is a main administrator.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {string} party Party UUID of the reportee.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean|null} True if the user is a main administrator.
 */
export function GetIsHovedadmin(userClient, party, labels = null) {
    const res = withRetries(
        () => userClient.GetIsHovedadmin(party, labels),
        "GetIsHovedadmin",
    );

    /** @type {boolean|null} */
    let isHovedadmin = null;

    const succeed = check(res, {
        "GetIsHovedadmin - status code is 200": (r) =>
            r.status === 200,
        "GetIsHovedadmin - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return isHovedadmin;
    }

    check(res, {
        "GetIsHovedadmin - body is valid": (r) => {
            try {
                isHovedadmin = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return isHovedadmin;
}
