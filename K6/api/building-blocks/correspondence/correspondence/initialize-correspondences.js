import { check } from "k6";

import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";

/**
 * Initializes one or more correspondences.
 *
 * This wrapper validates the k6 response and converts the API response
 * into an InitializeCorrespondencesResponseExt domain object.
 *
 * @param {CorrespondenceClient} correspondenceClient Client for the Correspondence API.
 * @param {InitializeCorrespondencesExt} requestBody Correspondence initialization payload.
 * Use {@link InitializeCorrespondencesBuilder} to construct this object.
 *
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 *
 * @returns {InitializeCorrespondencesResponseExt|null}
 * Initialized correspondence information or null when request fails.
 */
export function InitializeCorrespondences(
    correspondenceClient,
    requestBody,
    labels = null,
) {
    const res = correspondenceClient.InitializeCorrespondences(
        requestBody,
        labels,
    );

    /** @type {InitializeCorrespondencesResponseExt|null} */
    let initializedCorrespondences = null;

    const succeed = check(res, {
        "InitializeCorrespondences - status code is 200": (r) =>
            r.status === 200,

        "InitializeCorrespondences - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return initializedCorrespondences;
    }

    check(res, {
        "InitializeCorrespondences - body is valid": (r) => {
            try {
                initializedCorrespondences = JSON.parse(r.body);

                return initializedCorrespondences !== null;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return initializedCorrespondences;
}
