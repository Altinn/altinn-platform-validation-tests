import { check } from "k6";

import { AccessPackageClient } from "../../../../../clients/access-management-bff/access-package/index.js";

/**
 * Delegates an access package from one party to another.
 *
 * @param {AccessPackageClient} accessPackageClient Client for the access
 * package endpoints.
 * @param {CreateAccessPackageDelegationQuery|null} [queryParams] Optional
 * query parameters. Use {@link CreateAccessPackageDelegationQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the access package was delegated.
 */
export function CreateAccessPackageDelegation(
    accessPackageClient,
    queryParams = null,
    labels = null,
) {
    const res = accessPackageClient.CreateAccessPackageDelegation(
        queryParams,
        labels,
    );

    let delegated = false;

    const succeed = check(res, {
        "CreateAccessPackageDelegation - status code is 200": (r) =>
            r.status === 200,
        "CreateAccessPackageDelegation - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegated;
    }

    delegated = true;

    return delegated;
}
