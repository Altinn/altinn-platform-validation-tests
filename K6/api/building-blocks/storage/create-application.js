import { check } from "k6";

import { ApplicationsClient } from "../../../../clients/applications/applications.client.js";

/**
 * Creates application metadata.
 *
 * @param {ApplicationsClient} applicationsClient Applications API client.
 * @param {string|null} appId Application identifier.
 * @param {Application} application Application metadata.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Application|null}
 */
export function CreateApplication(
    applicationsClient,
    appId,
    application,
    labels = null,
) {
    const res = applicationsClient.CreateApplication(
        appId,
        application,
        labels,
    );

    /** @type {Application|null} */
    let createdApplication = null;

    const succeed = check(res, {
        "CreateApplication - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return createdApplication;
    }

    check(res, {
        "CreateApplication - body is valid": (r) => {
            try {
                createdApplication = JSON.parse(r.body);

                return true;
            } catch {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return createdApplication;
}
