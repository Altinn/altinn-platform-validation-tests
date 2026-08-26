import { check } from "k6";

import { GetAccessPackageDelegationCheckQuery } from "../../../../clients/access-management-bff/access-package/access-package.types.js";
import { AccessPackageClient } from "../../../../clients/access-management-bff/access-package/index.js";
import { DelegationCheck } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Checks which access packages the authenticated user can delegate for a
 * party.
 *
 * @param {AccessPackageClient} accessPackageClient Client for the access
 * package endpoints.
 * @param {GetAccessPackageDelegationCheckQuery|null} [queryParams] Optional
 * query parameters. Use {@link GetAccessPackageDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<DelegationCheck>|null} Delegation check results per access
 * package.
 */
export function GetAccessPackageDelegationCheck(
    accessPackageClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => accessPackageClient.GetAccessPackageDelegationCheck(
            queryParams,
            labels,
        ),
        "GetAccessPackageDelegationCheck",
    );

    /** @type {Array<DelegationCheck>|null} */
    let delegationChecks = null;

    const succeed = check(res, {
        "GetAccessPackageDelegationCheck - status code is 200": (r) =>
            r.status === 200,
        "GetAccessPackageDelegationCheck - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegationChecks;
    }

    check(res, {
        "GetAccessPackageDelegationCheck - body is valid": (r) => {
            try {
                delegationChecks = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegationChecks;
}
