import { check } from "k6";

import { LookupClient } from "../../../../clients/access-management-bff/lookup/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Looks up a user profile by user UUID.
 *
 * @param {LookupClient} lookupClient Client for the lookup endpoints.
 * @param {string} uuid User UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {UserProfileFE|null} The user profile.
 */
export function GetUser(lookupClient, uuid, labels = null) {
    const res = withRetries(
        () => lookupClient.GetUser(uuid, labels),
        "GetUser",
    );

    /** @type {UserProfileFE|null} */
    let userProfile = null;

    const succeed = check(res, {
        "GetUser - status code is 200": (r) =>
            r.status === 200,
        "GetUser - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return userProfile;
    }

    check(res, {
        "GetUser - body is valid": (r) => {
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
