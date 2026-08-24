import { check } from "k6";

import { ResourceRight } from "../../../../clients/access-management-bff/common/common.types.js";
import { SingleRightClient } from "../../../../clients/access-management-bff/single-right/index.js";
import { GetResourceRightsQuery } from "../../../../clients/access-management-bff/single-right/single-right.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the rights a party holds on a resource.
 *
 * @param {SingleRightClient} singleRightClient Client for the single right
 * endpoints.
 * @param {GetResourceRightsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetResourceRightsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ResourceRight|null} The rights on the resource.
 */
export function GetResourceRights(
    singleRightClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => singleRightClient.GetResourceRights(queryParams, labels),
        "GetResourceRights",
    );

    /** @type {ResourceRight|null} */
    let resourceRight = null;

    const succeed = check(res, {
        "GetResourceRights - status code is 200": (r) =>
            r.status === 200,
        "GetResourceRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resourceRight;
    }

    check(res, {
        "GetResourceRights - body is valid": (r) => {
            try {
                resourceRight = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resourceRight;
}
