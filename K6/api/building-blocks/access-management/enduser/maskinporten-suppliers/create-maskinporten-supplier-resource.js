import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../clients/maskinporten-suppliers/index.js";

/**
 * Creates a resource delegation for a Maskinporten supplier.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSupplierResourcesQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSupplierResourcesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {boolean} Whether the resource delegation was successfully created.
 */
export function CreateMaskinportenSupplierResource(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = maskinportenSuppliersClient.CreateMaskinportenSupplierResource(
        queryParams,
        labels,
    );

    /** @type {boolean} */
    let created = false;

    const succeed = check(res, {
        "CreateMaskinportenSupplierResource - status code is 200": (r) =>
            r.status === 200,
        "CreateMaskinportenSupplierResource - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return created;
    }

    check(res, {
        "CreateMaskinportenSupplierResource - body is valid": (r) => {
            try {
                created = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return created;
}
