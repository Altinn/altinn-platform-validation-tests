import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource-registry/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Deletes a resource.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} id Resource identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the operation succeeded.
 */
export function ResourceDeleteResource(
    resourceClient,
    id,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.ResourceDeleteResource(
            id,
            labels,
        ),
        "ResourceDeleteResource",
    );

    const succeed = check(res, {
        "ResourceDeleteResource - status code is 204": (r) =>
            r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    return true;
}
