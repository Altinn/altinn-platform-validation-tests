import { check } from "k6";

import {
    AuthorizedPartiesQuery,
    AuthorizedPartiesResponse,
    UrnAttribute,
} from "../../../../clients/authorization/authorized-parties.types.js";
import {
    AuthorizedPartiesClient,
} from "../../../../clients/authorization/index.js";

/**
 * Retrieves the parties the specified subject is authorized to represent.
 *
 * @param {AuthorizedPartiesClient} authorizedPartiesClient Client for the Authorized Parties API.
 * @param {string} type Subject identifier type (for example, "urn:altinn:person:identifier-no").
 * @param {string} value Subject identifier value.
 * @param {AuthorizedPartiesQuery|null} [queryParams]
 * Optional query parameters. Use {@link AuthorizedPartiesQueryBuilder} to
 * construct this object instead of creating it manually.
 * @param {Array<UrnAttribute>|null} [partyFilter]
 * Optional filter limiting the lookup to specific parties.
 * @param {{[key: string]: string}} [labels]
 * Optional k6 request tags that will be merged with the default request tags.
 * @returns {AuthorizedPartiesResponse} List of authorized parties.
 */
export function GetAuthorizedParties(
    authorizedPartiesClient,
    type,
    value,
    queryParams = null,
    partyFilter = null,
    labels = null,
) {
    const res = authorizedPartiesClient.GetAuthorizedParties(
        type,
        value,
        queryParams,
        partyFilter,
        labels,
    );

    /** @type {AuthorizedPartiesResponse} */
    let resBody = [];

    const succeed = check(res, {
        "GetAuthorizedParties - status code is 200": (r) => r.status === 200,
        "GetAuthorizedParties - status text is 200 OK": (r) => r.status_text === "200 OK",
    });

    if (!succeed) {
        console.log(res.status);
        console.log(res.body);
        return resBody;
    }

    check(res, {
        "GetAuthorizedParties - body is valid": (r) => {
            try {
                resBody = JSON.parse(r.body);
                return true;
            } catch (err) {
                console.log("Unable to parse response body");
                console.log(r.body);
                return false;
            }
        },
    });

    return resBody;
}
