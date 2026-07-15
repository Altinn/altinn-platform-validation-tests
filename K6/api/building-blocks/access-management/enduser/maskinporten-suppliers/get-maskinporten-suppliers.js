import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../clients/maskinporten-suppliers/index.js";

/**
 * Retrieves Maskinporten suppliers for a party.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSuppliersQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSuppliersQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<ConnectionDto>} Maskinporten supplier connections.
 */
export function GetMaskinportenSuppliers(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = maskinportenSuppliersClient.GetMaskinportenSuppliers(
        queryParams,
        labels,
    );

    /** @type {Array<ConnectionDto>} */
    let suppliers = [];

    const succeed = check(res, {
        "GetMaskinportenSuppliers - status code is 200": (r) =>
            r.status === 200,
        "GetMaskinportenSuppliers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return suppliers;
    }

    check(res, {
        "GetMaskinportenSuppliers - body is valid": (r) => {
            try {
                suppliers = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return suppliers;
}
