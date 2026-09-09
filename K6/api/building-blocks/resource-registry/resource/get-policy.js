import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource-registry/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the XACML policy for a resource.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} id Resource identifier.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the policy was successfully retrieved.
 */
export function ResourceGetPolicy(resourceClient, id, labels = null) {
    const res = withRetries(
        () => resourceClient.ResourceGetPolicy(id, labels),
        "ResourceGetPolicy",
    );

    const succeed = check(res, {
        "ResourceGetPolicy - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    return true;
}
