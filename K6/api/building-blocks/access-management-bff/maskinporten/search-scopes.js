import { check } from "k6";

import { PaginatedListOfServiceResourceFE } from "../../../../clients/access-management-bff/common/common.types.js";
import { MaskinportenClient } from "../../../../clients/access-management-bff/maskinporten/index.js";
import { SearchScopesQuery } from "../../../../clients/access-management-bff/maskinporten/maskinporten.types.js";
import { withRetries } from "../../common/retry.js";

/**
 * Searches the Maskinporten scopes a party can delegate.
 *
 * @param {MaskinportenClient} maskinportenClient Client for the Maskinporten
 * endpoints.
 * @param {SearchScopesQuery|null} [queryParams] Optional query parameters. Use
 * {@link SearchScopesQueryBuilder}.
 * @param {{[key: string]: string}|null} [labels] Optional k6 request labels.
 * @returns {PaginatedListOfServiceResourceFE|null} Paginated list of matching
 * scopes.
 */
export function SearchScopes(
    maskinportenClient,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => maskinportenClient.SearchScopes(queryParams, labels),
        "SearchScopes",
    );

    /** @type {PaginatedListOfServiceResourceFE|null} */
    let scopes = null;

    const succeed = check(res, {
        "SearchScopes - status code is 200": (r) =>
            r.status === 200,
        "SearchScopes - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return scopes;
    }

    check(res, {
        "SearchScopes - body is valid": (r) => {
            try {
                scopes = JSON.parse(r.body);

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return scopes;
}
