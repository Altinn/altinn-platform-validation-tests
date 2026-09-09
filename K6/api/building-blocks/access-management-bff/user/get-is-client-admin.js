import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Checks whether the authenticated user is a client administrator.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {string} party Party UUID of the reportee.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean|null} True if the user is a client administrator.
 */
export function GetIsClientAdmin(userClient, party, labels = null) {
    const res = withRetries(
        () => userClient.GetIsClientAdmin(party, labels),
        "GetIsClientAdmin",
    );

    /** @type {boolean|null} */
    let isClientAdmin = null;

    const succeed = check(res, {
        "GetIsClientAdmin - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return isClientAdmin;
    }

    check(res, {
        "GetIsClientAdmin - body is valid": (r) => {
            try {
                isClientAdmin = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return isClientAdmin;
}
