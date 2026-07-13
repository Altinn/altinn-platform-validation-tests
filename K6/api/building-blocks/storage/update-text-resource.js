import { check } from "k6";

import { ApplicationsClient } from "../../../../clients/storage/index.js";

/**
 * Updates an existing text resource.
 *
 * @param {ApplicationsClient} applicationsClient Applications API client.
 * @param {string} org Organization identifier.
 * @param {string} app Application identifier.
 * @param {string} language Language code.
 * @param {TextResource} textResource Updated text resource.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {TextResource|null} Updated text resource.
 */
export function UpdateTextResource(
    applicationsClient,
    org,
    app,
    language,
    textResource,
    labels = null,
) {
    const res = applicationsClient.UpdateTextResource(
        org,
        app,
        language,
        textResource,
        labels,
    );

    /** @type {TextResource|null} */
    let result = null;

    const succeed = check(res, {
        "UpdateTextResource - status code is 200": (r) => r.status === 200,
        "UpdateTextResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "UpdateTextResource - body is valid": (r) => {
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
