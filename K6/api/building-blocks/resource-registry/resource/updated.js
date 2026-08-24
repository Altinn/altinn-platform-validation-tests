import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource-registry/index.js";
import { UpdatedResourceSubjectPaginated, UpdatedResourceSubjectsQuery } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets updated resources since the provided last updated time.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {UpdatedResourceSubjectsQuery|null} [query] Query parameters.
 * Optional query parameters.
 * @param {{[key: string]: string}} [labels] See the API documentation.
 * Optional k6 request labels.
 * @returns {UpdatedResourceSubjectPaginated|null} Parsed response body, or null when the call failed.
 */
export function ResourceUpdated(
    resourceClient,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.ResourceUpdated(query, labels),
        "ResourceUpdated",
    );

    /** @type {UpdatedResourceSubjectPaginated|null} */
    let updatedResources = null;

    const succeed = check(res, {
        "ResourceUpdated - status code is 200": (r) =>
            r.status === 200,
        "ResourceUpdated - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return updatedResources;
    }

    check(res, {
        "ResourceUpdated - body is valid": (r) => {
            try {
                updatedResources = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return updatedResources;
}
