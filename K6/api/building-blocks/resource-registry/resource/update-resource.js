import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource-registry/index.js";
import { ServiceResource } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Updates a resource.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} id Resource identifier.
 * @param {ServiceResource} resource Updated resource.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the operation succeeded.
 */
export function ResourceUpdateResource(
    resourceClient,
    id,
    resource,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.ResourceUpdateResource(
            id,
            resource,
            labels,
        ),
        "ResourceUpdateResource",
    );

    return check(res, {
        "ResourceUpdateResource - status code is 200": (r) =>
            r.status === 200,
        "ResourceUpdateResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });
}
