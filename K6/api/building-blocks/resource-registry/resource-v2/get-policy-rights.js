import { check } from "k6";

import { ResourceV2Client } from "../../../../clients/resource-registry/index.js";
import { ResourceDecomposedDto, ResourcePolicyRightsQuery } from "../../../../clients/resource-registry/types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the decomposed policy rights of a resource.
 *
 * Returns the swagger's ResourceDecomposedDto, `{ rights: [{ right }] }`. The
 * registry answers with the RightDto list directly instead
 * (Altinn/altinn-resource-registry#878), so a list body is wrapped into that
 * shape here, with a warning, and nothing else needs to know. Once the
 * registry answers as declared, the wrapping is never taken.
 *
 * @param {ResourceV2Client} resourceV2Client Client for the Resource V2 API.
 * @param {string} id Resource identifier.
 * @param {ResourcePolicyRightsQuery|null} [query] Query parameters.
 * Optional query parameters.
 * @param {{[key: string]: string}|null} [labels] See the API documentation.
 * Optional k6 request labels.
 * @returns {ResourceDecomposedDto|null} Parsed response body, or null when the call failed.
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

    /** @type {ResourceDecomposedDto|null} */
    let decomposed = null;

    const succeed = check(res, {
        "ResourceV2GetPolicyRights - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return decomposed;
    }

    check(res, {
        "ResourceV2GetPolicyRights - body is valid": (r) => {
            try {
                const body = JSON.parse(r.body);

                if (Array.isArray(body)) {
                    console.warn("ResourceV2GetPolicyRights - the registry returned the RightDto list directly rather than ResourceDecomposedDto (Altinn/altinn-resource-registry#878); wrapping it");
                    decomposed = { rights: body.map((right) => ({ right })) };
                } else {
                    decomposed = body;
                }

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return decomposed;
}
