import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource-registry/index.js";
import { ServiceResource } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

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
    const res = withRetries(
        () => resourceClient.ResourceCreateResource(
            resource,
            labels,
        ),
        "ResourceCreateResource",
    );

    return check(res, {
        "ResourceCreateResource - status code is 200": (r) =>
            r.status === 200,
        "ResourceCreateResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });
}
