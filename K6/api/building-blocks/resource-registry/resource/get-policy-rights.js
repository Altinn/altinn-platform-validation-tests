import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Gets rights from a resource policy.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} id Resource identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<PolicyRightsDTO>|null} Policy rights.
 */
export function ResourceGetPolicyRights(
    resourceClient,
    id,
    labels = null,
) {
    const res = resourceClient.ResourceGetPolicyRights(id, labels);

    /** @type {Array<PolicyRightsDTO>|null} */
    let policyRights = null;

    const succeed = check(res, {
        "ResourceGetPolicyRights - status code is 200": (r) =>
            r.status === 200,
        "ResourceGetPolicyRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return policyRights;
    }

    check(res, {
        "ResourceGetPolicyRights - body is valid": (r) => {
            try {
                policyRights = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return policyRights;
}
