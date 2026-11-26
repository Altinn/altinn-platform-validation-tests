import { check } from "k6";

import { DeleteAdministratorQuery } from "../../../../clients/access-management-bff/bankruptcy-estate/bankruptcy-estate.types.js";
import { BankruptcyEstateClient } from "../../../../clients/access-management-bff/bankruptcy-estate/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Removes an administrator from a bankruptcy estate.
 *
 * @param {BankruptcyEstateClient} bankruptcyEstateClient Client for the bankruptcy estate
 * endpoints.
 * @param {DeleteAdministratorQuery|null} [queryParams] Optional query parameters. Use
 * {@link DeleteAdministratorQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean} True if the administrator was removed.
 */
export function DeleteAdministrator(
    bankruptcyEstateClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => bankruptcyEstateClient.DeleteAdministrator(queryParams, labels),
        "DeleteAdministrator",
    );

    let removed = false;

    const succeed = check(res, {
        "DeleteAdministrator - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return removed;
    }

    removed = true;

    return removed;
}
