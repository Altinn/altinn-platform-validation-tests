import { check } from "k6";

import { MaskinportenSuppliersClient } from "../../../../clients/maskinporten-suppliers/index.js";

/**
 * Creates a Maskinporten supplier connection.
 *
 * @param {MaskinportenSuppliersClient} maskinportenSuppliersClient Client for the Maskinporten Suppliers API.
 * @param {MaskinportenSuppliersQuery|null} [queryParams]
 * Query parameters. Use {@link MaskinportenSuppliersQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {AssignmentDto|null} Created Maskinporten supplier assignment.
 */
export function CreateMaskinportenSupplier(
    maskinportenSuppliersClient,
    queryParams = null,
    labels = null,
) {
    const res = maskinportenSuppliersClient.CreateMaskinportenSupplier(
        queryParams,
        labels,
    );

    /** @type {AssignmentDto|null} */
    let assignment = null;

    const succeed = check(res, {
        "CreateMaskinportenSupplier - status code is 200": (r) =>
            r.status === 200,
        "CreateMaskinportenSupplier - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return assignment;
    }

    check(res, {
        "CreateMaskinportenSupplier - body is valid": (r) => {
            try {
                assignment = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return assignment;
}
