import { check } from "k6";

import { Application } from "../../../clients/storage/applications.types.js";
import { ApplicationsClient } from "../../../clients/storage/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Retrieves applications deployed by an organization.
 *
 * @param {ApplicationsClient} applicationsClient Applications API client.
 * @param {string} org Organization identifier.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {Array<Application>} Parsed response body, or null when the call failed.
 */
export function GetApplicationsByOrg(
    applicationsClient,
    org,
    labels = null,
) {
    const res = withRetries(
        () => applicationsClient.GetApplicationsByOrg(
            org,
            labels,
        ),
        "GetApplicationsByOrg",
    );

    /** @type {Array<Application>} */
    let applications = [];

    const succeed = check(res, {
        "GetApplicationsByOrg - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return applications;
    }

    check(res, {
        "GetApplicationsByOrg - body is valid": (r) => {
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
