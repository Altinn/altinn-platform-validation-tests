import { check } from "k6";

import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes a Maskinporten supplier from a party.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {DeleteSupplierQuery} queryParams Query parameters. Use
 * {@link DeleteSupplierQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
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
        "DeleteSupplier - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return removed;
    }

    removed = true;

    return removed;
}
