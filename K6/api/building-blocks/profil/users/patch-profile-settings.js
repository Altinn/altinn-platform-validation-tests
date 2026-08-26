import { check } from "k6";

import { UsersClient } from "../../../../clients/profil/users/index.js";
import { ProfileSettingPreference, ProfileSettingsPatchRequest } from "../../../../clients/profil/users/users.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Partially updates the profile settings of the current user.
 *
 * @param {UsersClient} usersClient Client for the Users API.
 * @param {ProfileSettingsPatchRequest} request Profile settings patch request.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ProfileSettingPreference|null} Updated profile settings.
 */
export function PatchProfileSettings(
    usersClient,
    request,
    labels = null,
) {
    const res = withRetries(
        () => usersClient.PatchProfileSettings(
            request,
            labels,
        ),
        "PatchProfileSettings",
    );

    /** @type {ProfileSettingPreference|null} */
    let profileSettingPreference = null;

    const succeed = check(res, {
        "PatchProfileSettings - status code is 200": (r) =>
            r.status === 200,
        "PatchProfileSettings - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return profileSettingPreference;
    }

    check(res, {
        "PatchProfileSettings - body is valid": (r) => {
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
