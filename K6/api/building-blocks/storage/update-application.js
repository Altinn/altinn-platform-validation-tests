import { check } from "k6";

import { ApplicationsClient } from "../../../../clients/storage/index.js";

/**
 * Updates application metadata for a given application.
 *
 * @param {ApplicationsClient} applicationsClient Applications API client.
 * @param {string} org Application owner organization.
 * @param {string} app Application identifier.
 * @param {Application} application Updated application metadata.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Application|null} Updated application.
 */
export function UpdateApplication(
    applicationsClient,
    org,
    app,
    application,
    labels = null,
) {
    const res = applicationsClient.UpdateApplication(
        org,
        app,
        application,
        labels,
    );

    /** @type {Application|null} */
    let result = null;

    const succeed = check(res, {
        "UpdateApplication - status code is 200": (r) => r.status === 200,
        "UpdateApplication - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "UpdateApplication - body is valid": (r) => {
            try {
                result = JSON.parse(r.body);
                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);
                return false;
            }
        },
    });

    return result;
}
