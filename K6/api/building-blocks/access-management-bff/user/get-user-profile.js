import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";

/**
 * Gets the profile of the authenticated user.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {UserProfileFE|null} The user profile.
 */
export function GetUserProfile(userClient, labels = null) {
    const res = userClient.GetUserProfile(labels);

    /** @type {UserProfileFE|null} */
    let userProfile = null;

    const succeed = check(res, {
        "GetUserProfile - status code is 200": (r) =>
            r.status === 200,
        "GetUserProfile - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return userProfile;
    }

    check(res, {
        "GetUserProfile - body is valid": (r) => {
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
