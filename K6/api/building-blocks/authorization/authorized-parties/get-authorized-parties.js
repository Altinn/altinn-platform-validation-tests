import { check } from "k6";

import { AuthorizedPartiesQuery, AuthorizedPartiesRequest, AuthorizedPartiesResponse } from "../../../../clients/authorization/authorized-parties.types.js";
import { AuthorizedPartiesClient } from "../../../../clients/authorization/index.js";

/**
 * Retrieves the parties the specified subject is authorized to represent.
 *
 * Use {@link AuthorizedPartiesRequestBuilder} to create the request object.
 * Use {@link AuthorizedPartiesQueryBuilder} to create query parameters.
 *
 * @param {AuthorizedPartiesClient} authorizedPartiesClient Client for the Authorized Parties API.
 * @param {AuthorizedPartiesRequest} request Authorized parties lookup request.
 * @param {AuthorizedPartiesQuery|null} [queryParams]
 * Optional query parameters. Use {@link AuthorizedPartiesQueryBuilder} to
 * construct this object instead of creating it manually.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request tags that will be merged with the default request tags.
 * @returns {AuthorizedPartiesResponse} List of authorized parties.
 */
export function GetAuthorizedParties(
    authorizedPartiesClient,
    request,
    queryParams = null,
    labels = null,
) {
    const res = authorizedPartiesClient.GetAuthorizedParties(
        request,
        queryParams,
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
