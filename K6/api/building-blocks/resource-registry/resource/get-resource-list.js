import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Gets all resources.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {ResourceListQueryBuilder|Object} [query] Optional query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<ServiceResource>|null} List of resources.
 */
export function ResourceGetResourceList(
    resourceClient,
    query = null,
    labels = null,
) {
    const res = resourceClient.ResourceGetResourceList(query, labels);

    /** @type {Array<ServiceResource>|null} */
    let resources = null;

    const succeed = check(res, {
        "ResourceGetResourceList - status code is 200": (r) =>
            r.status === 200,
        "ResourceGetResourceList - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
