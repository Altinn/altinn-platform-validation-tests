import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource-registry/index.js";
import { ResourceSearchQueryBuilder, ServiceResource } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Searches for resources in the resource registry.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {ResourceSearchQueryBuilder | object} [query] Search query parameters.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<ServiceResource>|null} Matching resources.
 */
export function ResourceSearch(
    resourceClient,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.ResourceSearch(query, labels),
        "ResourceSearch",
    );

    /** @type {Array<ServiceResource>|null} */
    let resources = null;

    const succeed = check(res, {
        "ResourceSearch - status code is 200": (r) =>
            r.status === 200,
        "ResourceSearch - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resources;
    }

    check(res, {
        "ResourceSearch - body is valid": (r) => {
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
