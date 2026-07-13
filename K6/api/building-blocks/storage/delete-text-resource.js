import { check } from "k6";

import { ApplicationsClient } from "../../../../clients/storage/index.js";

/**
 * Deletes an existing text resource.
 *
 * @param {ApplicationsClient} applicationsClient Applications API client.
 * @param {string} org Organization identifier.
 * @param {string} app Application identifier.
 * @param {string} language Language code.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {boolean} True when deletion succeeds.
 */
export function DeleteTextResource(
    applicationsClient,
    org,
    app,
    language,
    labels = null,
) {
    const res = applicationsClient.DeleteTextResource(
        org,
        app,
        language,
        labels,
    );

    const succeed = check(res, {
        "DeleteTextResource - status code is 200": (r) => r.status === 200,
        "DeleteTextResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);

        return false;
    }

    return true;
}
