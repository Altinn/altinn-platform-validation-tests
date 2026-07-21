import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Deletes a resource.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} id Resource identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the operation succeeded.
 */
export function ResourceDeleteResource(
    resourceClient,
    id,
    labels = null,
) {
    const res = resourceClient.ResourceDeleteResource(
        id,
        labels,
    );

    return check(res, {
        "ResourceDeleteResource - status code is 200": (r) =>
            r.status === 200,
        "ResourceDeleteResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });
}
