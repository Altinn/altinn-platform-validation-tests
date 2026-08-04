import { check } from "k6";

import { SettingsClient } from "../../../../../clients/access-management-bff/settings/index.js";

/**
 * Updates the language of the authenticated user.
 *
 * @param {SettingsClient} settingsClient Client for the settings endpoints.
 * @param {SettingsControllerUpdateSelectedLanguageRequest|null} [body] The
 * language to select. Use
 * {@link SettingsControllerUpdateSelectedLanguageRequestBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the language was updated.
 */
export function UpdateSelectedLanguage(
    settingsClient,
    body = null,
    labels = null,
) {
    const res = settingsClient.UpdateSelectedLanguage(body, labels);

    let updated = false;

    const succeed = check(res, {
        "UpdateSelectedLanguage - status code is 200": (r) =>
            r.status === 200,
        "UpdateSelectedLanguage - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return updated;
    }

    updated = true;

    return updated;
}
