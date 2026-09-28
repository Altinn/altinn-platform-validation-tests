import { check } from "k6";

import { UserClient } from "../../../../clients/access-management-bff/user/index.js";
import { ProfileSettingPreference } from "../../../../clients/profil/users/users.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Updates whether deleted entities are shown for the authenticated user.
 *
 * @param {UserClient} userClient Client for the user endpoints.
 * @param {boolean|null} [body] Whether to show deleted entities.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ProfileSettingPreference|null} The updated profile setting
 * preferences.
 */
export function UpdateShowDeleted(userClient, body = null, labels = null) {
    const res = withRetries(
        () => userClient.UpdateShowDeleted(body, labels),
        "UpdateShowDeleted",
    );

    /** @type {ProfileSettingPreference|null} */
    let profileSettingPreference = null;

    const succeed = check(res, {
        "UpdateShowDeleted - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return profileSettingPreference;
    }

    check(res, {
        "UpdateShowDeleted - body is valid": (r) => {
            try {
                profileSettingPreference = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return profileSettingPreference;
}
