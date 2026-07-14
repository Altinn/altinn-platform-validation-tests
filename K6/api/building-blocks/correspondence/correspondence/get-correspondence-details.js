import { check } from "k6";

import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";

/**
 * Retrieves detailed information about a correspondence.
 *
 * This wrapper validates the k6 response and converts the API response
 * into a CorrespondenceDetailsExt domain object.
 *
 * @param {CorrespondenceClient} correspondenceClient Client for the Correspondence API.
 * @param {string} correspondenceId Correspondence UUID.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 *
 * @returns {CorrespondenceDetailsExt|null} Correspondence details or null when request fails.
 */
export function GetCorrespondenceDetails(
    correspondenceClient,
    correspondenceId,
    labels = null,
) {
    const res = correspondenceClient.GetCorrespondenceDetails(
        correspondenceId,
        labels,
    );

    /** @type {CorrespondenceDetailsExt|null} */
    let correspondenceDetails = null;

    const succeed = check(res, {
        "GetCorrespondenceDetails - status code is 200": (r) =>
            r.status === 200,

        "GetCorrespondenceDetails - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return correspondenceDetails;
    }

    check(res, {
        "GetCorrespondenceDetails - body is valid": (r) => {
            try {
                correspondenceDetails = JSON.parse(r.body);

                return correspondenceDetails !== null;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return correspondenceDetails;
}
