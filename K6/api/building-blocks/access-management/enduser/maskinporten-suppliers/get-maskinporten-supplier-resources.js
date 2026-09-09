import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/index.js";
import { MaskinportenSupplierResourcesQuery, ResourcePermissionDto } from "../../../../../clients/access-management/enduser/maskinporten-suppliers/maskinporten-suppliers.types.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Retrieves resource permissions for Maskinporten suppliers.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSupplierResourcesQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSupplierResourcesQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<ResourcePermissionDto>} Maskinporten supplier resource permissions.
 */
export function GetMaskinportenSupplierResources(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenSuppliersClient.GetMaskinportenSupplierResources(
            queryParams,
            labels,
        ),
        "GetMaskinportenSupplierResources",
    );

    /** @type {Array<ResourcePermissionDto>} */
    let resources = [];

    const succeed = check(res, {
        "GetMaskinportenSupplierResources - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resources;
    }

    check(res, {
        "GetMaskinportenSupplierResources - body is valid": (r) => {
            try {
                resources = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return resources;
}
