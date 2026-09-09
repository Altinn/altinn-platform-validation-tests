import { check } from "k6";

import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { CreateSupplierResourceQuery } from "../../../../clients/access-management-bff/maskinporten/maskinporten.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Delegates a resource to a Maskinporten supplier.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {CreateSupplierResourceQuery} queryParams Query parameters. Use
 * {@link CreateSupplierResourceQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean|null} True if the resource was delegated.
 */
export function CreateSupplierResource(
    maskinportenClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenClient.CreateSupplierResource(queryParams, labels),
        "CreateSupplierResource",
    );

    /** @type {boolean|null} */
    let delegated = null;

    const succeed = check(res, {
        "CreateSupplierResource - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return delegated;
    }

    check(res, {
        "CreateSupplierResource - body is valid": (r) => {
            try {
                delegated = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return delegated;
}
