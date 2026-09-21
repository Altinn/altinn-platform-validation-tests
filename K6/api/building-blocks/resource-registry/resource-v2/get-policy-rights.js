import { check } from "k6";

import { ResourceV2Client } from "../../../../clients/resource-registry/index.js";
import { ResourcePolicyRightsQuery, RightDto } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the policy rights for a resource.
 *
 * The swagger declares the body as ResourceDecomposedDto, an object with a
 * `rights` list, but the controller returns the RightDto list directly
 * (ResourceV2Controller.GetRights returns Ok(IEnumerable<RightDto>)), and that
 * is what every environment answers with. This returns what is on the wire.
 *
 * @param {ResourceV2Client} resourceV2Client Client for the Resource V2 API.
 * @param {string} id Resource identifier.
 * @param {ResourcePolicyRightsQuery|null} [query] Query parameters.
 * Optional query parameters.
 * @param {{[key: string]: string}|null} [labels] See the API documentation.
 * Optional k6 request labels.
 * @returns {Array<RightDto>|null} Parsed response body, or null when the call failed.
 */
export function ResourceV2GetPolicyRights(
    resourceV2Client,
    id,
    query = null,
    labels = null,
) {
    const res = withRetries(
        () => resourceV2Client.ResourceV2GetPolicyRights(
            id,
            query,
            labels,
        ),
        "ResourceV2GetPolicyRights",
    );

    /** @type {Array<RightDto>|null} */
    let resource = null;

    const succeed = check(res, {
        "ResourceV2GetPolicyRights - status code is 200": (r) =>
            r.status === 200,
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
