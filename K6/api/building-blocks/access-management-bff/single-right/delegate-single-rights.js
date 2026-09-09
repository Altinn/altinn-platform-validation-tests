import { check } from "k6";

import { SingleRightClient } from "../../../../clients/access-management-bff/single-right/index.js";
import { DelegateSingleRightsQuery } from "../../../../clients/access-management-bff/single-right/single-right.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Delegates rights on a resource to a party.
 *
 * @param {SingleRightClient} singleRightClient Client for the single right
 * endpoints.
 * @param {DelegateSingleRightsQuery|null} [queryParams] Optional query
 * parameters. Use {@link DelegateSingleRightsQueryBuilder}.
 * @param {Array<string>|null} [body] Keys of the rights to delegate.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the rights were delegated.
 */
export function DelegateSingleRights(
    singleRightClient,
    queryParams = null,
    body = null,
    labels = null,
) {
    const res = withRetries(
        () => singleRightClient.DelegateSingleRights(
            queryParams,
            body,
            labels,
        ),
        "DelegateSingleRights",
    );

    let delegated = false;

    const succeed = check(res, {
        "DelegateSingleRights - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegated;
    }

    delegated = true;

    return delegated;
}
