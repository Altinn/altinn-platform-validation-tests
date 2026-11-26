import { check } from "k6";

import { GetIsBankruptcyEstateAdminQuery } from "../../../../clients/access-management-bff/bankruptcy-estate/bankruptcy-estate.types.js";
import { BankruptcyEstateClient } from "../../../../clients/access-management-bff/bankruptcy-estate/index.js";
import { withRetries } from "../../common/retry.js";

/**
 * Checks whether the authenticated user is a bankruptcy estate administrator.
 *
 * @param {BankruptcyEstateClient} bankruptcyEstateClient Client for the bankruptcy estate
 * endpoints.
 * @param {GetIsBankruptcyEstateAdminQuery|null} [queryParams] Optional query parameters. Use
 * {@link GetIsBankruptcyEstateAdminQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {boolean|null} True if the user is a bankruptcy estate administrator.
 */
export function GetIsBankruptcyEstateAdmin(
    bankruptcyEstateClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => bankruptcyEstateClient.GetIsBankruptcyEstateAdmin(queryParams, labels),
        "GetIsBankruptcyEstateAdmin",
    );

    /** @type {boolean|null} */
    let isAdmin = null;

    const succeed = check(res, {
        "GetIsBankruptcyEstateAdmin - status code is 200": (r) =>
            r.status === 200,
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return isAdmin;
    }

    check(res, {
        "GetIsBankruptcyEstateAdmin - body is valid": (r) => {
            try {
                isAdmin = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return isAdmin;
}
