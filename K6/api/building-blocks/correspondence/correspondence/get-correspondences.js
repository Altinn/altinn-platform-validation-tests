import { check } from "k6";

import { CorrespondenceQuery } from "../../../../clients/correspondence/correspondence.types.js";
import { CorrespondenceClient } from "../../../../clients/correspondence/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Retrieves a list of correspondences for the authenticated user.
 *
 * The API supports filtering through query parameters.
 * Use {@link CorrespondenceQueryBuilder} to construct query parameters.
 *
 * @param {CorrespondenceClient} correspondenceClient Client for the Correspondence API.
 * @param {CorrespondenceQuery|null} [queryParams]
 * Query parameters for filtering correspondences.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request labels.
 * @returns {Array<string>} Correspondence ids. Empty array when request fails.
 */
export function GetCorrespondences(
    correspondenceClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => correspondenceClient.GetCorrespondences(
            queryParams,
            labels,
        ),
        "GetCorrespondences",
    );

    /** @type {Array<string>} */
    let correspondenceIds = [];

    const succeed = check(res, {
        "GetCorrespondences - status code is 200": (r) =>
            r.status === 200,

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

                if (
                    !Array.isArray(body?.ids) ||
                    !body.ids.every(
                        (/** @type {unknown} */ id) =>
                            typeof id === "string" && id.length > 0,
                    )
                ) {
                    return false;
                }

                correspondenceIds = body.ids;

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
