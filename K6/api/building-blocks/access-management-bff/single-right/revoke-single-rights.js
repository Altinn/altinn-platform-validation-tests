import { check } from "k6";

import { SingleRightClient } from "../../../../clients/access-management-bff/single-right/index.js";
import { RevokeSingleRightsQuery } from "../../../../clients/access-management-bff/single-right/single-right.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Revokes all rights a party holds on a resource.
 *
 * @param {SingleRightClient} singleRightClient Client for the single right
 * endpoints.
 * @param {RevokeSingleRightsQuery|null} [queryParams] Optional query
 * parameters. Use {@link RevokeSingleRightsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the rights were revoked.
 */
export function RevokeSingleRights(
    singleRightClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => singleRightClient.RevokeSingleRights(queryParams, labels),
        "RevokeSingleRights",
    );

    let revoked = false;

    const succeed = check(res, {
        "RevokeSingleRights - status code is 200": (r) =>
            r.status === 200,
        "RevokeSingleRights - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return revoked;
    }

    revoked = true;

    return revoked;
}
