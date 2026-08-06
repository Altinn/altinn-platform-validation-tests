import { check } from "k6";

import { AuthorizedPartiesClient } from "../../../../../clients/access-management/enduser/authorized-parties/index.js";

/**
 * Retrieves the parties the authenticated end user is authorized to represent.
 *
 * @param {AuthorizedPartiesClient|null} [authorizedPartiesClient] TODO: description
 * @param {AuthorizedPartiesQuery|null} [queryParams]
 * Optional query parameters. Prefer using
 * {@link AuthorizedPartiesQueryBuilder} to construct this object.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags.
 * @returns {AuthorizedPartyDtoListPaginatedResult} TODO: description
 */
export function GetAuthorizedParties(
    authorizedPartiesClient,
    queryParams,
    labels
) {
    const res = authorizedPartiesClient.GetAuthorizedParties(
        queryParams,
        labels,
    );

    /** @type {AuthorizedPartyDtoListPaginatedResult|null} */
    let authorizedParties = null;

    const succeed = check(res, {
        "GetAuthorizedParties - status code is 200": (r) =>
            r.status === 200,
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
                authorizedParties = JSON.parse(r.body);

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
