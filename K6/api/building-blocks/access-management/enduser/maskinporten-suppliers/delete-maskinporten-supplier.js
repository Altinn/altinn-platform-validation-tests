import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../clients/maskinporten-suppliers/index.js";

/**
 * Deletes a Maskinporten supplier connection.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSuppliersQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSuppliersQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the supplier connection was successfully deleted.
 */
export function DeleteMaskinportenSupplier(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = maskinportenSuppliersClient.DeleteMaskinportenSupplier(
        queryParams,
        labels,
    );

    const succeed = check(res, {
        "DeleteMaskinportenSupplier - status code is 204": (r) =>
            r.status === 204,
        "DeleteMaskinportenSupplier - status text is 204 No Content": (r) =>
            r.status_text === "204 No Content",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return false;
    }

    return true;
}
