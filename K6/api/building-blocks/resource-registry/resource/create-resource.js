import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Creates a resource.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {ServiceResource} resource Resource payload.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the operation succeeded.
 */
export function ResourceCreateResource(
    resourceClient,
    resource,
    labels = null,
) {
    const res = resourceClient.ResourceCreateResource(
        resource,
        labels,
    );

    return check(res, {
        "ResourceCreateResource - status code is 200": (r) =>
            r.status === 200,
        "ResourceCreateResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });
}
