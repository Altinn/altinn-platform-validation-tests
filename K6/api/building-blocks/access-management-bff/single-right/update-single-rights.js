import { check } from "k6";

import { SingleRightClient } from "../../../../clients/access-management-bff/single-right/index.js";
import { UpdateSingleRightsQuery } from "../../../../clients/access-management-bff/single-right/single-right.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Replaces the rights a party holds on a resource.
 *
 * @param {SingleRightClient} singleRightClient Client for the single right
 * endpoints.
 * @param {UpdateSingleRightsQuery|null} [queryParams] Optional query
 * parameters. Use {@link UpdateSingleRightsQueryBuilder}.
 * @param {Array<string>|null} [body] Keys of the rights to keep.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the rights were updated.
 */
export function UpdateSingleRights(
    singleRightClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => singleRightClient.UpdateSingleRights(
            queryParams,
            body,
            labels,
        ),
        "UpdateSingleRights",
    );

    let updated = false;

    const succeed = check(res, {
        "UpdateSingleRights - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return updated;
    }

    updated = true;

    return updated;
}
