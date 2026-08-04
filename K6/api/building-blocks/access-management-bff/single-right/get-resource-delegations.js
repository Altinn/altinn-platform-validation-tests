import { check } from "k6";

import { SingleRightClient } from "../../../../../clients/access-management-bff/single-right/index.js";

/**
 * Gets the resources delegated between two parties.
 *
 * @param {SingleRightClient} singleRightClient Client for the single right
 * endpoints.
 * @param {GetResourceDelegationsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetResourceDelegationsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<ResourceDelegation>|null} The resource delegations.
 */
export function GetResourceDelegations(
    singleRightClient,
    queryParams = null,
    labels = null,
) {
    const res = singleRightClient.GetResourceDelegations(queryParams, labels);

    /** @type {Array<ResourceDelegation>|null} */
    let resourceDelegations = null;

    const succeed = check(res, {
        "GetResourceDelegations - status code is 200": (r) =>
            r.status === 200,
        "GetResourceDelegations - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resourceDelegations;
    }

    check(res, {
        "GetResourceDelegations - body is valid": (r) => {
            try {
                resourceDelegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resourceDelegations;
}
