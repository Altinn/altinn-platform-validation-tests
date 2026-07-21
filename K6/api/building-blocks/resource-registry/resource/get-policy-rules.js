import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Gets flattened policy rules for a resource.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} id Resource identifier.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<PolicyRuleDTO>|null} Policy rules.
 */
export function ResourceGetPolicyRules(
    resourceClient,
    id,
    labels = null,
) {
    const res = resourceClient.ResourceGetPolicyRules(id, labels);

    /** @type {Array<PolicyRuleDTO>|null} */
    let policyRules = null;

    const succeed = check(res, {
        "ResourceGetPolicyRules - status code is 200": (r) =>
            r.status === 200,
        "ResourceGetPolicyRules - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return policyRules;
    }

    check(res, {
        "ResourceGetPolicyRules - body is valid": (r) => {
            try {
                policyRules = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return policyRules;
}
