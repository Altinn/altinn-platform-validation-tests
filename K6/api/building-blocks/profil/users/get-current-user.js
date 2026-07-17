import { check } from "k6";

import { UsersClient } from "../../../../clients/users/index.js";

/**
 * Gets the current user based on the request context.
 *
 * @param {UsersClient} usersClient Client for the Users API.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {UserProfile|null} User profile.
 */
export function GetCurrentUser(
    usersClient,
    labels = null,
) {
    const res = usersClient.GetCurrentUser(
        labels,
    );

    /** @type {UserProfile|null} */
    let userProfile = null;

    const succeed = check(res, {
        "GetCurrentUser - status code is 200": (r) =>
            r.status === 200,
        "GetCurrentUser - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
