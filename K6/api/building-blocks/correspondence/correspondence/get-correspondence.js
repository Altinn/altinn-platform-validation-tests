import { check } from "k6";

import { CorrespondenceOverviewExt } from "../../../../clients/correspondence/correspondence.types.js";
import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves a correspondence by id.
 *
 * This wrapper validates the k6 response and converts the API response
 * into a CorrespondenceOverviewExt domain object.
 *
 * @param {CorrespondenceClient} correspondenceClient Client for the Correspondence API.
 * @param {string} correspondenceId Correspondence UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {CorrespondenceOverviewExt|null} Correspondence overview or null when request fails.
 */
export function GetCorrespondence(
    correspondenceClient,
    correspondenceId,
    labels = null,
) {
    const res = withRetries(
        () => correspondenceClient.GetCorrespondence(
            correspondenceId,
            labels,
        ),
        "GetCorrespondence",
    );

    /** @type {CorrespondenceOverviewExt|null} */
    let correspondence = null;

    const succeed = check(res, {
        "GetCorrespondence - status code is 200": (r) =>
            r.status === 200,

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
