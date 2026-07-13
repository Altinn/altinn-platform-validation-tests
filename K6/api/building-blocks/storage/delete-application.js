import { check } from "k6";

import { ApplicationsClient } from "../../../../clients/storage/index.js";

/**
 * Deletes application metadata.
 *
 * @param {ApplicationsClient} applicationsClient Applications API client.
 * @param {string} org Application owner organization.
 * @param {string} app Application identifier.
 * @param {boolean|null} [hard] Permanently delete application.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Application|null} Deleted application metadata.
 */
export function DeleteApplication(
    applicationsClient,
    org,
    app,
    hard = null,
    labels = null,
) {
    const res = applicationsClient.DeleteApplication(
        org,
        app,
        hard,
        labels,
    );

    /** @type {Application|null} */
    let result = null;

    const succeed = check(res, {
        "DeleteApplication - status code is 200": (r) => r.status === 200,
        "DeleteApplication - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "DeleteApplication - body is valid": (r) => {
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
