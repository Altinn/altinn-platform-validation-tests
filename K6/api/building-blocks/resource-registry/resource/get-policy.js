import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Gets the XACML policy for a resource.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} id Resource identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the policy was successfully retrieved.
 */
export function ResourceGetPolicy(resourceClient, id, labels = null) {
    const res = resourceClient.ResourceGetPolicy(id, labels);


    const succeed = check(res, {
        "ResourceGetPolicy - status code is 200": (r) =>
            r.status === 200,
        "ResourceGetPolicy - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    return true;
}
