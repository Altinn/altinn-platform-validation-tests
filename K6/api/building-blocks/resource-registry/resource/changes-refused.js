import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource-registry/index.js";
import { AltinnValidationProblem, ResourceChangesQuery } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Asks for the changes feed expecting the registry to refuse the request.
 *
 * {@link ResourceChanges} asserts 200 and hands back the page, so a query that
 * means to be refused comes here instead. The status belongs to the building
 * block either way; what the test asserts on is the problem body.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {number} expectedStatus The status the request is expected to be refused with.
 * @param {ResourceChangesQuery|null} [query] Query parameters.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AltinnValidationProblem|null} The problem body, or null when the
 * request was not refused as expected or carried no parsable body.
 */
export function ResourceChangesRefused(
    resourceClient,
    expectedStatus,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.ResourceChanges(query, labels),
        "ResourceChangesRefused",
    );

    /** @type {AltinnValidationProblem|null} */
    let problem = null;

    const refused = check(res, {
        [`ResourceChangesRefused - status code is ${expectedStatus}`]: (r) =>
            r.status === expectedStatus,
    });

    if (!refused) {
        console.log(res.status);
        console.log(res.body);

        return problem;
    }

    // A refusal does not have to carry a problem body, and an empty one is not a
    // failure of the refusal itself, so this only reports what came back.
    try {
        problem = JSON.parse(res.body);
    } catch (err) {
        problem = null;
    }

    return problem;
}
