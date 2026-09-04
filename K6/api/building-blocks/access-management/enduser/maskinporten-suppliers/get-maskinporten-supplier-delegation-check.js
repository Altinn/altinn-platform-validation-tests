import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/index.js";
import { MaskinportenSupplierDelegationCheckQuery } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/maskinporten-suppliers.types.js";
import { ResourceCheckDto } from "../../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Checks whether a Maskinporten supplier resource can be delegated.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSupplierDelegationCheckQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSupplierDelegationCheckQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {ResourceCheckDto|null} Resource delegation check result.
 */
export function GetMaskinportenSupplierDelegationCheck(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenSuppliersClient.GetMaskinportenSupplierDelegationCheck(
            queryParams,
            labels,
        ),
        "GetMaskinportenSupplierDelegationCheck",
    );

    /** @type {ResourceCheckDto|null} */
    let result = null;

    const succeed = check(res, {
        "GetMaskinportenSupplierDelegationCheck - status code is 200": (r) =>
            r.status === 200,
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
