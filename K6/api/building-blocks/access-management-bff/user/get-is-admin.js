import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Checks whether the authenticated user is an administrator for the reportee.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {string} party Party UUID of the reportee.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean|null} True if the user is an administrator.
 */
export function GetIsAdmin(userClient, party, labels = null) {
    const res = withRetries(
        () => userClient.GetIsAdmin(party, labels),
        "GetIsAdmin",
    );

    /** @type {boolean|null} */
    let isAdmin = null;

    const succeed = check(res, {
        "GetIsAdmin - status code is 200": (r) =>
            r.status === 200,
        "GetIsAdmin - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return isAdmin;
    }

    check(res, {
        "GetIsAdmin - body is valid": (r) => {
            try {
                isAdmin = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return isAdmin;
}
