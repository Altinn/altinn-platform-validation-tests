import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";

/**
 * Checks whether the authenticated user is a Maskinporten administrator.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean|null} True if the user is a Maskinporten administrator.
 */
export function GetIsMaskinportenAdmin(userClient, labels = null) {
    const res = userClient.GetIsMaskinportenAdmin(labels);

    /** @type {boolean|null} */
    let isMaskinportenAdmin = null;

    const succeed = check(res, {
        "GetIsMaskinportenAdmin - status code is 200": (r) =>
            r.status === 200,
        "GetIsMaskinportenAdmin - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return isMaskinportenAdmin;
    }

    check(res, {
        "GetIsMaskinportenAdmin - body is valid": (r) => {
            try {
                isMaskinportenAdmin = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return isMaskinportenAdmin;
}
