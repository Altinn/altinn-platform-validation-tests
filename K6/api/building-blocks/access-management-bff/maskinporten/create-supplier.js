import { check } from "k6";

import { AssignmentDto } from "../../../../clients/access-management-bff/common/common.types.js";
import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { CreateSupplierQuery } from "../../../../clients/access-management-bff/maskinporten/maskinporten.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Adds a Maskinporten supplier to a party.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {CreateSupplierQuery} queryParams Query parameters. Use
 * {@link CreateSupplierQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {AssignmentDto|null} The created assignment.
 */
export function CreateSupplier(
    maskinportenClient,
    queryParams,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenClient.CreateSupplier(queryParams, labels),
        "CreateSupplier",
    );

    /** @type {AssignmentDto|null} */
    let assignment = null;

    const succeed = check(res, {
        "CreateSupplier - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return assignment;
    }

    check(res, {
        "CreateSupplier - body is valid": (r) => {
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
