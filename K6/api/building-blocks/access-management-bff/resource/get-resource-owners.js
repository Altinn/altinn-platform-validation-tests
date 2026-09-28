import { check } from "k6";

import { ResourceOwnerFE } from "../../../../clients/access-management-bff/common/common.types.js";
import { ResourceClient } from "../../../../clients/access-management-bff/resource/index.js";
import { GetResourceOwnersQuery } from "../../../../clients/access-management-bff/resource/resource.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the resource owners that have delegable resources.
 *
 * @param {ResourceClient} resourceClient Client for the resource endpoints.
 * @param {GetResourceOwnersQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetResourceOwnersQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<ResourceOwnerFE>|null} The resource owners.
 */
export function GetResourceOwners(
    resourceClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => resourceClient.GetResourceOwners(queryParams, labels),
        "GetResourceOwners",
    );

    /** @type {Array<ResourceOwnerFE>|null} */
    let resourceOwners = null;

    const succeed = check(res, {
        "GetResourceOwners - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resourceOwners;
    }

    check(res, {
        "GetResourceOwners - body is valid": (r) => {
            try {
                resourceOwners = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resourceOwners;
}
