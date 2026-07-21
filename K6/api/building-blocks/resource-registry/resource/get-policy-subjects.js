import { check } from "k6";

import { ResourceClient } from "../../../../clients/resource/index.js";

/**
 * Gets subjects from policy rules.
 *
 * @param {ResourceClient} resourceClient Client for the Resource API.
 * @param {string} id Resource identifier.
 * @param {boolean|null} [reloadFromXacml] Defines if subjects should be reloaded from XACML.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AttributeMatchV2Paginated|null} Policy subjects.
 */
export function ResourceGetPolicySubjects(
    resourceClient,
    id,
    reloadFromXacml = null,
    labels = null,
) {
    const res = resourceClient.ResourceGetPolicySubjects(
        id,
        reloadFromXacml,
        labels,
    );

    /** @type {AttributeMatchV2Paginated|null} */
    let subjects = null;

    const succeed = check(res, {
        "ResourceGetPolicySubjects - status code is 200": (r) =>
            r.status === 200,
        "ResourceGetPolicySubjects - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return subjects;
    }

    check(res, {
        "ResourceGetPolicySubjects - body is valid": (r) => {
            try {
                subjects = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return subjects;
}
