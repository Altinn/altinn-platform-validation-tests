import { check } from "k6";

import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";

/**
 * Revokes a resource delegated to a Maskinporten supplier.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {DeleteSupplierResourceQuery} queryParams Query parameters. Use
 * {@link DeleteSupplierResourceQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} True if the resource was revoked.
 */
export function DeleteSupplierResource(
    maskinportenClient,
    queryParams,
    labels = null,
) {
    const res = maskinportenClient.DeleteSupplierResource(queryParams, labels);

    let revoked = false;

    const succeed = check(res, {
        "DeleteSupplierResource - status code is 200": (r) =>
            r.status === 200,
        "DeleteSupplierResource - status text is 200 OK": (r) =>
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
