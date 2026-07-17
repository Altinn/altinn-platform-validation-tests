import { check } from "k6";

import { UsersClient } from "../../../../clients/users/index.js";

/**
 * Updates the profile settings of the current user.
 *
 * @param {UsersClient} usersClient Client for the Users API.
 * @param {ProfileSettingPutRequest} request Profile settings update request.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ProfileSettingPreference|null} Updated profile settings.
 */
export function UpdateProfileSettings(
    usersClient,
    request,
    labels = null,
) {
    const res = usersClient.UpdateProfileSettings(
        request,
        labels,
    );

    /** @type {ProfileSettingPreference|null} */
    let profileSettingPreference = null;

    const succeed = check(res, {
        "UpdateProfileSettings - status code is 200": (r) =>
            r.status === 200,
        "UpdateProfileSettings - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return profileSettingPreference;
    }

    check(res, {
        "UpdateProfileSettings - body is valid": (r) => {
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
