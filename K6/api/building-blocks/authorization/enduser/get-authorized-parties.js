import { check } from "k6";

import { AuthorizedPartiesClient } from "../../../../clients/authorization/index.js";

/**
 * Retrieves the parties the authenticated user is authorized to represent.
 *
 * The API returns a paginated response where `data` contains arrays of parties.
 * This wrapper removes the pagination grouping but keeps party hierarchy intact.
 *
 * @param {AuthorizedPartiesClient} authorizedPartiesClient Client for the Authorized Parties API.
 * @param {EndUserAuthorizedPartiesQuery|null} [queryParams]
 * Query parameters. Use {@link EndUserAuthorizedPartiesQueryBuilder}.
 * @param {{[key: string]: string}} [labels] Optional k6 request labels.
 * @returns {Array<AuthorizedPartyDto>} Authorized parties with subunits preserved.
 */
export function GetAuthorizedParties(
    authorizedPartiesClient,
    queryParams = null,
    labels = null,
) {
    const res = authorizedPartiesClient.GetAuthorizedParties(
        queryParams,
        labels,
    );

    /** @type {Array<AuthorizedPartyDto>} */
    let authorizedParties = [];

    const succeed = check(res, {
        "GetAuthorizedParties - status code is 200": (r) => r.status === 200,
        "GetAuthorizedParties - status text is 200 OK": (r) =>
            r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return authorizedParties;
    }

    check(res, {
        "GetAuthorizedParties - body is valid": (r) => {
            try {
                const body = JSON.parse(r.body);

                authorizedParties = body.data?.flat() ?? [];

                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);

                return false;
            }
        },
    });

    return authorizedParties;
}
