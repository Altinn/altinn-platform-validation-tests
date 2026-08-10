import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";

/**
 * Checks whether the authenticated user is an instance administrator.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {string} party Party UUID of the reportee.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean|null} True if the user is an instance administrator.
 */
export function GetIsInstanceAdmin(userClient, party, labels = null) {
    const res = userClient.GetIsInstanceAdmin(party, labels);

    /** @type {boolean|null} */
    let isInstanceAdmin = null;

    const succeed = check(res, {
        "GetIsInstanceAdmin - status code is 200": (r) =>
            r.status === 200,
        "GetIsInstanceAdmin - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return isInstanceAdmin;
    }

    check(res, {
        "GetIsInstanceAdmin - body is valid": (r) => {
            try {
                isInstanceAdmin = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return isInstanceAdmin;
}
