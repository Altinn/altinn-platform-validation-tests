import { check } from "k6";

import { ApplicationsClient } from "../../../../clients/applications/applications.client.js";

/**
 * Retrieves all applications.
 *
 * @param {ApplicationsClient} applicationsClient Applications API client.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {Array<Application>} Applications.
 */
export function GetApplications(
    applicationsClient,
    labels = null,
) {
    const res = applicationsClient.GetApplications(labels);

    /** @type {Array<Application>} */
    let applications = [];

    const succeed = check(res, {
        "GetApplications - status code is 200": (r) =>
            r.status === 200,
        "GetApplications - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return applications;
    }

    check(res, {
        "GetApplications - body is valid": (r) => {
            try {
                const body = JSON.parse(r.body);

                applications = body.applications ?? [];

                return true;
            } catch {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return applications;
}
