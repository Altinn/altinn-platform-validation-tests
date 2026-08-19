import { check } from "k6";

import { UsersClient } from "../../../../clients/profil/users/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the user profile for a given SSN.
 *
 * @param {UsersClient} usersClient Client for the Users API.
 * @param {string} ssn User social security number.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {UserProfile|null} User profile.
 */
export function GetUserBySsn(
    usersClient,
    ssn,
    labels = null,
) {
    const res = withRetries(
        () => usersClient.GetUserBySsn(
            ssn,
            labels,
        ),
        "GetUserBySsn",
    );

    /** @type {UserProfile|null} */
    let userProfile = null;

    const succeed = check(res, {
        "GetUserBySsn - status code is 200": (r) =>
            r.status === 200,
        "GetUserBySsn - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return userProfile;
    }

    check(res, {
        "GetUserBySsn - body is valid": (r) => {
            try {
                userProfile = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return userProfile;
}
