import { check } from "k6";

import { ApplicationsClient } from "../../../../clients/applications/applications.client.js";

/**
 * Retrieves a specific application.
 *
 * @param {ApplicationsClient} applicationsClient Applications API client.
 * @param {string} org Organization identifier.
 * @param {string} app Application identifier.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Application|null}
 */
export function GetApplication(
    applicationsClient,
    org,
    app,
    labels = null,
) {
    const res = applicationsClient.GetApplication(
        org,
        app,
        labels,
    );

    /** @type {Application|null} */
    let application = null;

    const succeed = check(res, {
        "GetApplication - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return application;
    }

    check(res, {
        "GetApplication - body is valid": (r) => {
            try {
                application = JSON.parse(r.body);

                return true;
            } catch {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return application;
}
