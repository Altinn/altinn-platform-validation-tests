import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../clients/maskinporten-suppliers/index.js";

/**
 * Retrieves resource permissions for Maskinporten suppliers.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSupplierResourcesQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSupplierResourcesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<ResourcePermissionDto>} Maskinporten supplier resource permissions.
 */
export function GetMaskinportenSupplierResources(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = maskinportenSuppliersClient.GetMaskinportenSupplierResources(
        queryParams,
        labels,
    );

    /** @type {Array<ResourcePermissionDto>} */
    let resources = [];

    const succeed = check(res, {
        "GetMaskinportenSupplierResources - status code is 200": (r) =>
            r.status === 200,
        "GetMaskinportenSupplierResources - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
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
