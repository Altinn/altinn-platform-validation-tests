import { check } from "k6";

import { Right } from "../../../../clients/access-management-bff/common/common.types.js";
import { SingleRightClient } from "../../../../clients/access-management-bff/single-right/index.js";
import { GetRightsMetaQuery } from "../../../../clients/access-management-bff/single-right/single-right.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the rights a resource defines.
 *
 * @param {SingleRightClient} singleRightClient Client for the single right
 * endpoints.
 * @param {GetRightsMetaQuery|null} [queryParams] Optional query parameters.
 * Use {@link GetRightsMetaQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<Right>|null} The rights of the resource.
 */
export function GetRightsMeta(
    singleRightClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => singleRightClient.GetRightsMeta(queryParams, labels),
        "GetRightsMeta",
    );

    /** @type {Array<Right>|null} */
    let rights = null;

    const succeed = check(res, {
        "GetRightsMeta - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rights;
    }

    check(res, {
        "GetRightsMeta - body is valid": (r) => {
            try {
                rights = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return rights;
}
