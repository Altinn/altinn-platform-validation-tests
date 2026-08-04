import { check } from "k6";

import { AccessPackageClient } from "../../../../../clients/access-management-bff/access-package/index.js";

/**
 * Revokes a delegated access package.
 *
 * @param {AccessPackageClient} accessPackageClient Client for the access
 * package endpoints.
 * @param {DeleteAccessPackageDelegationQuery|null} [queryParams] Optional
 * query parameters. Use {@link DeleteAccessPackageDelegationQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the access package delegation was revoked.
 */
export function DeleteAccessPackageDelegation(
    accessPackageClient,
    queryParams = null,
    labels = null,
) {
    const res = accessPackageClient.DeleteAccessPackageDelegation(
        queryParams,
        labels,
    );

    let revoked = false;

    const succeed = check(res, {
        "DeleteAccessPackageDelegation - status code is 200": (r) =>
            r.status === 200,
        "DeleteAccessPackageDelegation - status text is 200 OK": (r) =>
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
