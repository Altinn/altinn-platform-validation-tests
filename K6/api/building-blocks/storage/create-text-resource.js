import { check } from "k6";

import { ApplicationsClient } from "../../../../clients/storage/index.js";

/**
 * Creates a new text resource.
 *
 * @param {ApplicationsClient} applicationsClient Applications API client.
 * @param {string} org Organization identifier.
 * @param {string} app Application identifier.
 * @param {TextResource} textResource Text resource.
 * @param {{[key:string]:string}} [labels] Optional k6 request labels.
 * @returns {TextResource|null} Created text resource.
 */
export function CreateTextResource(
    applicationsClient,
    org,
    app,
    textResource,
    labels = null,
) {
    const res = applicationsClient.CreateTextResource(
        org,
        app,
        textResource,
        labels,
    );

    /** @type {TextResource|null} */
    let result = null;

    const succeed = check(res, {
        "CreateTextResource - status code is 200": (r) => r.status === 200,
        "CreateTextResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "CreateTextResource - body is valid": (r) => {
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
