import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../clients/maskinporten-suppliers/index.js";

/**
 * Checks whether a Maskinporten supplier resource can be delegated.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSupplierDelegationCheckQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSupplierDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {ResourceCheckDto|null} Resource delegation check result.
 */
export function GetMaskinportenSupplierDelegationCheck(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = maskinportenSuppliersClient.GetMaskinportenSupplierDelegationCheck(
        queryParams,
        labels,
    );

    /** @type {ResourceCheckDto|null} */
    let result = null;

    const succeed = check(res, {
        "GetMaskinportenSupplierDelegationCheck - status code is 200": (r) =>
            r.status === 200,
        "GetMaskinportenSupplierDelegationCheck - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return result;
    }

    check(res, {
        "GetMaskinportenSupplierDelegationCheck - body is valid": (r) => {
            try {
                result = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return result;
}
