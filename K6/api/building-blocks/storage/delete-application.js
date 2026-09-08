import { check } from "k6";

import { Application } from "../../../clients/storage/applications.types.js";
import { ApplicationsClient } from "../../../clients/storage/index.js";
import { withRetries } from "../common/retry.js";

/**
 * Deletes application metadata.
 *
 * @param {ApplicationsClient} applicationsClient Applications API client.
 * @param {string} org Application owner organization.
 * @param {string} app Application identifier.
 * @param {boolean|null} [hard] Permanently delete application.
 * @param {{[key:string]:string}|null} [labels] Optional k6 request labels.
 * @returns {Application|null} Deleted application metadata.
 */
export function DeleteApplication(
    applicationsClient,
    org,
    app,
    hard = null,
    labels = null,
) {
    const res = withRetries(
        () => applicationsClient.DeleteApplication(
            org,
            app,
            hard,
            labels,
        ),
        "DeleteApplication",
    );

    /** @type {Application|null} */
    let result = null;

    const succeed = check(res, {
        "DeleteApplication - status code is 200": (r) => r.status === 200,
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
