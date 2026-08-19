import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Deletes a resource delegation for a Maskinporten supplier.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSupplierResourcesQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSupplierResourcesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the resource delegation was successfully deleted.
 */
export function DeleteMaskinportenSupplierResource(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenSuppliersClient.DeleteMaskinportenSupplierResource(
            queryParams,
            labels,
        ),
        "DeleteMaskinportenSupplierResource",
    );

    const succeed = check(res, {
        "DeleteMaskinportenSupplierResource - status code is 204": (r) =>
            r.status === 204,
        "DeleteMaskinportenSupplierResource - status text is 204 No Content": (
            r,
        ) => r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    return true;
}
