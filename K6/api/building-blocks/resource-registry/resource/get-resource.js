import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Gets a resource.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} id Resource identifier.
 * @param {{versionId?: number}|Object} [query] Optional query parameters.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ServiceResource|null} Resource.
 */
export function ResourceGetResource(
    resourceClient,
    id,
    query = null,
    labels = null,
) {
    const res = resourceClient.ResourceGetResource(
        id,
        query,
        labels,
    );

    /** @type {ServiceResource|null} */
    let resource = null;

    const succeed = check(res, {
        "ResourceGetResource - status code is 200": (r) =>
            r.status === 200,
        "ResourceGetResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resource;
    }

    check(res, {
        "ResourceGetResource - body is valid": (r) => {
            try {
                resource = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resource;
}
