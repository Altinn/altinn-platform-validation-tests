import { check } from "k6";

import { ResourceClient } from "../../../../clients/access-management-bff/resource/index.js";

/**
 * Searches the resources a party can delegate.
 *
 * @param {ResourceClient} resourceClient Client for the resource endpoints.
 * @param {SearchResourcesQuery|null} [queryParams] Optional query parameters.
 * Use {@link SearchResourcesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {PaginatedListOfServiceResourceFE|null} Paginated list of matching
 * resources.
 */
export function SearchResources(
    resourceClient,
    queryParams = null,
    labels = null,
) {
    const res = resourceClient.SearchResources(queryParams, labels);

    /** @type {PaginatedListOfServiceResourceFE|null} */
    let resources = null;

    const succeed = check(res, {
        "SearchResources - status code is 200": (r) =>
            r.status === 200,
        "SearchResources - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resources;
    }

    check(res, {
        "SearchResources - body is valid": (r) => {
            try {
                resources = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resources;
}
