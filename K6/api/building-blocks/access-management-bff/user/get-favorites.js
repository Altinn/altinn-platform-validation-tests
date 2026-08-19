import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the favourite actors of the authenticated user.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<string>|null} Party UUIDs of the favourite actors.
 */
export function GetFavorites(userClient, labels = null) {
    const res = withRetries(
        () => userClient.GetFavorites(labels),
        "GetFavorites",
    );

    /** @type {Array<string>|null} */
    let favorites = null;

    const succeed = check(res, {
        "GetFavorites - status code is 200": (r) =>
            r.status === 200,
        "GetFavorites - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return favorites;
    }

    check(res, {
        "GetFavorites - body is valid": (r) => {
            try {
                favorites = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return favorites;
}
