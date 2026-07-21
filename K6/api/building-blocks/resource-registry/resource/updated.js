import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Gets updated resources since the provided last updated time.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {ResourceUpdatedQueryBuilder|Object} [query]
 * Optional query parameters.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {UpdatedResourceSubjectPaginated|null}
 */
export function ResourceUpdated(
    resourceClient,
    query = null,
    labels = null,
) {
    const res = resourceClient.ResourceUpdated(query, labels);

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
