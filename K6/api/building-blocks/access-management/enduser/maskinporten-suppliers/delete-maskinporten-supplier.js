import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/index.js";
import { MaskinportenSuppliersQuery } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/maskinporten-suppliers.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Deletes a Maskinporten supplier connection.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSuppliersQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSuppliersQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the supplier connection was successfully deleted.
 */
export function DeleteMaskinportenSupplier(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenSuppliersClient.DeleteMaskinportenSupplier(
            queryParams,
            labels,
        ),
        "DeleteMaskinportenSupplier",
    );

    const succeed = check(res, {
        "DeleteMaskinportenSupplier - status code is 204": (r) =>
            r.status === 204,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    return true;
}
