import { check } from "k6";

import { ResourceV2Client } from "../../../../clients/resource-v2/index.js";

/**
 * Gets the policy rights for a resource.
 *
 * @param {ResourceV2Client} resourceV2Client Client for the Resource V2 API.
 * @param {string} id Resource identifier.
 * @param {Object|null} [query]
 * Optional query parameters.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request labels.
 * @returns {ResourceDecomposedDto|null}
 */
export function ResourceV2GetPolicyRights(
    resourceV2Client,
    id,
    query = null,
    labels = null,
) {
    const res = resourceV2Client.ResourceV2GetPolicyRights(
        id,
        query,
        labels,
    );

    /** @type {ResourceDecomposedDto|null} */
    let resource = null;

    const succeed = check(res, {
        "ResourceV2GetPolicyRights - status code is 200": (r) =>
            r.status === 200,
        "ResourceV2GetPolicyRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resource;
    }

    check(res, {
        "ResourceV2GetPolicyRights - body is valid": (r) => {
            try {
                resource = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resource;
}
