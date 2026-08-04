import { check } from "k6";

import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";

/**
 * Gets the Maskinporten suppliers of a party.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {GetSuppliersQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetSuppliersQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<MaskinportenConnection>|null} The Maskinporten suppliers.
 */
export function GetSuppliers(
    maskinportenClient,
    queryParams = null,
    labels = null,
) {
    const res = maskinportenClient.GetSuppliers(queryParams, labels);

    /** @type {Array<MaskinportenConnection>|null} */
    let suppliers = null;

    const succeed = check(res, {
        "GetSuppliers - status code is 200": (r) =>
            r.status === 200,
        "GetSuppliers - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return suppliers;
    }

    check(res, {
        "GetSuppliers - body is valid": (r) => {
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
