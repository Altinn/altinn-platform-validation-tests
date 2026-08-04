import { check } from "k6";

import { SingleRightClient } from "../../../../../clients/access-management-bff/single-right/index.js";

/**
 * Gets the rights a resource defines.
 *
 * @param {SingleRightClient} singleRightClient Client for the single right
 * endpoints.
 * @param {GetRightsMetaQuery|null} [queryParams] Optional query parameters.
 * Use {@link GetRightsMetaQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<Right>|null} The rights of the resource.
 */
export function GetRightsMeta(
    singleRightClient,
    queryParams = null,
    labels = null,
) {
    const res = singleRightClient.GetRightsMeta(queryParams, labels);

    /** @type {Array<Right>|null} */
    let rights = null;

    const succeed = check(res, {
        "GetRightsMeta - status code is 200": (r) =>
            r.status === 200,
        "GetRightsMeta - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
