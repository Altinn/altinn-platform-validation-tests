import { check } from "k6";

import { UsersClient } from "../../../../clients/profil/users/index.js";
import { UserProfile } from "../../../../clients/profil/users/users.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the current user based on the request context.
 *
 * @param {UsersClient} usersClient Client for the Users API.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {UserProfile|null} User profile.
 */
export function GetCurrentUser(
    usersClient,
    labels = null,
) {
    const res = withRetries(
        () => usersClient.GetCurrentUser(
            labels,
        ),
        "GetCurrentUser",
    );

    /** @type {UserProfile|null} */
    let userProfile = null;

    const succeed = check(res, {
        "GetCurrentUser - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return userProfile;
    }

    check(res, {
        "GetCurrentUser - body is valid": (r) => {
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
