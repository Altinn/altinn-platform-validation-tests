import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource-registry/index.js";
import { ResourceListQueryBuilder, ServiceResource } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets all resources.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {ResourceListQueryBuilder | object|null} [query] Optional query parameters.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<ServiceResource>|null} List of resources.
 */
export function ResourceGetResourceList(
    resourceClient,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.ResourceGetResourceList(query, labels),
        "ResourceGetResourceList",
    );

    /** @type {Array<ServiceResource>|null} */
    let resources = null;

    const succeed = check(res, {
        "ResourceGetResourceList - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resources;
    }

    check(res, {
        "ResourceGetResourceList - body is valid": (r) => {
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
