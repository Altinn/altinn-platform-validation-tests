import { check } from "k6";

import { GetAccessPackageDelegationsQuery } from "../../../../clients/access-management-bff/access-package/access-package.types.js";
import { AccessPackageClient } from "../../../../clients/access-management-bff/access-package/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the access packages delegated between two parties.
 *
 * @param {AccessPackageClient} accessPackageClient Client for the access
 * package endpoints.
 * @param {GetAccessPackageDelegationsQuery|null} [queryParams] Optional query
 * parameters. Use {@link GetAccessPackageDelegationsQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {object|null} Access package delegations grouped by area. The API
 * does not publish a schema for this response.
 */
export function GetAccessPackageDelegations(
    accessPackageClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => accessPackageClient.GetAccessPackageDelegations(
            queryParams,
            labels,
        ),
        "GetAccessPackageDelegations",
    );

    /** @type {object|null} */
    let delegations = null;

    const succeed = check(res, {
        "GetAccessPackageDelegations - status code is 200": (r) =>
            r.status === 200,
        "GetAccessPackageDelegations - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegations;
    }

    check(res, {
        "GetAccessPackageDelegations - body is valid": (r) => {
            try {
                delegations = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegations;
}
