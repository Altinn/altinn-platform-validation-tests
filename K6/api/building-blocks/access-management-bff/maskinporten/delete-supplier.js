import { check } from "k6";

import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { DeleteSupplierQuery } from "../../../../clients/access-management-bff/maskinporten/maskinporten.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes a Maskinporten supplier from a party.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {DeleteSupplierQuery} queryParams Query parameters. Use
 * {@link DeleteSupplierQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the supplier was removed.
 */
export function DeleteSupplier(
    maskinportenClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenClient.DeleteSupplier(queryParams, labels),
        "DeleteSupplier",
    );

    let removed = false;

    const succeed = check(res, {
        "DeleteSupplier - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return removed;
    }

    removed = true;

    return removed;
}
