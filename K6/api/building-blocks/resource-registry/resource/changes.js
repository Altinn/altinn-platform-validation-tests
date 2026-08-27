import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource-registry/index.js";
import { ResourceChangePaginated, ResourceChangesQuery } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the feed of resources that have changed.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {ResourceChangesQuery|null} [query] Query parameters.
 * Optional query parameters.
 * @param {{[key: string]: string}|null} [labels] See the API documentation.
 * Optional k6 request labels.
 * @returns {ResourceChangePaginated|null} Parsed response body, or null when the call failed.
 */
export function ResourceChanges(
    resourceClient,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.ResourceChanges(query, labels),
        "ResourceChanges",
    );

    /** @type {ResourceChangePaginated|null} */
    let changes = null;

    const succeed = check(res, {
        "ResourceChanges - status code is 200": (r) =>
            r.status === 200,
        "ResourceChanges - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return changes;
    }

    check(res, {
        "ResourceChanges - body is valid": (r) => {
            try {
                changes = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return changes;
}
