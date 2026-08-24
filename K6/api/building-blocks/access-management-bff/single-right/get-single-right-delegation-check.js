import { check } from "k6";

import { RightCheck } from "../../../../clients/access-management-bff/common/common.types.js";
import { SingleRightClient } from "../../../../clients/access-management-bff/single-right/index.js";
import { GetSingleRightDelegationCheckQuery } from "../../../../clients/access-management-bff/single-right/single-right.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Checks which rights on a resource the authenticated user can delegate.
 *
 * @param {SingleRightClient} singleRightClient Client for the single right
 * endpoints.
 * @param {GetSingleRightDelegationCheckQuery|null} [queryParams] Optional
 * query parameters. Use {@link GetSingleRightDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<RightCheck>|null} Delegation check results.
 */
export function GetSingleRightDelegationCheck(
    singleRightClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => singleRightClient.GetSingleRightDelegationCheck(
            queryParams,
            labels,
        ),
        "GetSingleRightDelegationCheck",
    );

    /** @type {Array<RightCheck>|null} */
    let rightChecks = null;

    const succeed = check(res, {
        "GetSingleRightDelegationCheck - status code is 200": (r) =>
            r.status === 200,
        "GetSingleRightDelegationCheck - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return rightChecks;
    }

    check(res, {
        "GetSingleRightDelegationCheck - body is valid": (r) => {
            try {
                rightChecks = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return rightChecks;
}
