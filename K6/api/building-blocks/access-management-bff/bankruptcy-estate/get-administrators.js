import { check } from "k6";

import { GetAdministratorsQuery } from "../../../../clients/access-management-bff/bankruptcy-estate/bankruptcy-estate.types.js";
import { BankruptcyEstateClient } from "../../../../clients/access-management-bff/bankruptcy-estate/index.js";
import { BankruptcyEstateAdministratorFE } from "../../../../clients/access-management-bff/common/common.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Gets the administrators of a bankruptcy estate.
 *
 * @param {BankruptcyEstateClient} bankruptcyEstateClient Client for the bankruptcy estate
 * endpoints.
 * @param {GetAdministratorsQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetAdministratorsQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {Array<BankruptcyEstateAdministratorFE>|null} The administrators.
 */
export function GetAdministrators(
    bankruptcyEstateClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => bankruptcyEstateClient.GetAdministrators(queryParams, labels),
        "GetAdministrators",
    );

    /** @type {Array<BankruptcyEstateAdministratorFE>|null} */
    let administrators = null;

    const succeed = check(res, {
        "GetAdministrators - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return administrators;
    }

    check(res, {
        "GetAdministrators - body is valid": (r) => {
            try {
                administrators = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return administrators;
}
