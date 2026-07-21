import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Updates or overwrites the XACML policy for a resource.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} id Resource identifier.
 * @param {*} policyFile XACML policy file.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the policy was successfully updated.
 */
export function ResourceUpdatePolicy(
    resourceClient,
    id,
    policyFile,
    labels = null,
) {
    const res = resourceClient.ResourceUpdatePolicy(
        id,
        policyFile,
        labels,
    );

    const succeed = check(res, {
        "ResourceUpdatePolicy - status code is 200": (r) =>
            r.status === 200,
        "ResourceUpdatePolicy - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    return true;
}
