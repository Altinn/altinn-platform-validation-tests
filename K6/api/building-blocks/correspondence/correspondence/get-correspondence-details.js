import { check } from "k6";

import { CorrespondenceDetailsExt } from "../../../../clients/correspondence/correspondence.types.js";
import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves detailed information about a correspondence.
 *
 * This wrapper validates the k6 response and converts the API response
 * into a CorrespondenceDetailsExt domain object.
 *
 * @param {CorrespondenceClient} correspondenceClient Client for the Correspondence API.
 * @param {string} correspondenceId Correspondence UUID.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {CorrespondenceDetailsExt|null} Correspondence details or null when request fails.
 */
export function GetCorrespondenceDetails(
    correspondenceClient,
    correspondenceId,
    labels = null,
) {
    const res = withRetries(
        () => correspondenceClient.GetCorrespondenceDetails(
            correspondenceId,
            labels,
        ),
        "GetCorrespondenceDetails",
    );

    /** @type {CorrespondenceDetailsExt|null} */
    let correspondenceDetails = null;

    const succeed = check(res, {
        "GetCorrespondenceDetails - status code is 200": (r) =>
            r.status === 200,

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
