import { check } from "k6";

import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";

/**
 * Retrieves a correspondence by id.
 *
 * This wrapper validates the k6 response and converts the API response
 * into a CorrespondenceOverviewExt domain object.
 *
 * @param {CorrespondenceClient} correspondenceClient Client for the Correspondence API.
 * @param {string} correspondenceId Correspondence UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 *
 * @returns {CorrespondenceOverviewExt|null} Correspondence overview or null when request fails.
 */
export function GetCorrespondence(
    correspondenceClient,
    correspondenceId,
    labels = null,
) {
    const res = correspondenceClient.GetCorrespondence(
        correspondenceId,
        labels,
    );

    /** @type {CorrespondenceOverviewExt|null} */
    let correspondence = null;

    const succeed = check(res, {
        "GetCorrespondence - status code is 200": (r) =>
            r.status === 200,

        "GetCorrespondence - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return correspondence;
    }

    check(res, {
        "GetCorrespondence - body is valid": (r) => {
            try {
                correspondence = JSON.parse(r.body);

                return correspondence !== null;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return correspondence;
}
