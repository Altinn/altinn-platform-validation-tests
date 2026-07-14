import { check } from "k6";

import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";

/**
 * Retrieves a list of correspondences for the authenticated user.
 *
 * The API supports filtering through query parameters.
 * Use {@link CorrespondenceQueryBuilder} to construct query parameters.
 *
 * @param {CorrespondenceClient} correspondenceClient Client for the Correspondence API.
 * @param {CorrespondenceQuery|null} [queryParams]
 * Query parameters for filtering correspondences.
 *
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 *
 * @returns {Array<string>} Correspondence ids. Empty array when request fails.
 */
export function GetCorrespondences(
    correspondenceClient,
    queryParams = null,
    labels = null,
) {
    const res = correspondenceClient.GetCorrespondences(
        queryParams,
        labels,
    );

    /** @type {Array<string>} */
    let correspondenceIds = [];

    const succeed = check(res, {
        "GetCorrespondences - status code is 200": (r) =>
            r.status === 200,

        "GetCorrespondences - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return correspondenceIds;
    }

    check(res, {
        "GetCorrespondences - body is valid": (r) => {
            try {
                const body = JSON.parse(r.body);

                correspondenceIds = body.ids ?? [];

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return correspondenceIds;
}
