import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/index.js";
import { ConnectionDto, MaskinportenSuppliersQuery } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/maskinporten-suppliers.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves Maskinporten suppliers for a party.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSuppliersQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSuppliersQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<ConnectionDto>} Maskinporten supplier connections.
 */
export function GetMaskinportenSuppliers(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenSuppliersClient.GetMaskinportenSuppliers(
            queryParams,
            labels,
        ),
        "GetMaskinportenSuppliers",
    );

    /** @type {Array<ConnectionDto>} */
    let suppliers = [];

    const succeed = check(res, {
        "GetMaskinportenSuppliers - status code is 200": (r) =>
            r.status === 200,
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
