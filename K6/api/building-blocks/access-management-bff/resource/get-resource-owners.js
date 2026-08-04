import { check } from "k6";

import { ResourceClient } from "../../../../clients/access-management-bff/resource/index.js";

/**
 * Gets the resource owners that have delegable resources.
 *
 * @param {ResourceClient} resourceClient Client for the resource endpoints.
 * @param {GetResourceOwnersQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetResourceOwnersQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<ResourceOwnerFE>|null} The resource owners.
 */
export function GetResourceOwners(
    resourceClient,
    queryParams = null,
    labels = null,
) {
    const res = resourceClient.GetResourceOwners(queryParams, labels);

    /** @type {Array<ResourceOwnerFE>|null} */
    let resourceOwners = null;

    const succeed = check(res, {
        "GetResourceOwners - status code is 200": (r) =>
            r.status === 200,
        "GetResourceOwners - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
