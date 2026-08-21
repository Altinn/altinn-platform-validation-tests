import { check } from "k6";

import { AuthorizedPartiesQuery, AuthorizedPartiesRequest, ProblemDetails } from "../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties.types.js";
import { AuthorizedPartiesClient } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { withRetries } from "../../../common/retry.js";

/**
 * Asks for authorized parties expecting the endpoint to refuse the request.
 *
 * {@link GetAuthorizedParties} asserts 200 and hands back the parties, so the
 * scenarios that mean to be refused come here instead. The status belongs to the
 * building block either way; what the scenario asserts on is the problem body.
 *
 * @param {AuthorizedPartiesClient} authorizedPartiesClient Client for the Authorized Parties API.
 * @param {number} expectedStatus The status the request is expected to be refused with.
 * @param {AuthorizedPartiesRequest} request Authorized parties lookup request.
 * @param {AuthorizedPartiesQuery|null} [queryParams]
 * Optional query parameters. Use {@link AuthorizedPartiesQueryBuilder} to
 * construct this object instead of creating it manually.
 * @param {{[key: string]: string}|null} [labels]
 * Optional k6 request tags that will be merged with the default request tags.
 * @returns {ProblemDetails|null} The problem body, or null when the request was
 * not refused as expected or carried no parsable body.
 */
export function GetAuthorizedPartiesRefused(
    authorizedPartiesClient,
    expectedStatus,
    request,
    queryParams = null,
    labels = null,
) {
    const res = withRetries(
        () => authorizedPartiesClient.GetAuthorizedParties(
            request,
            queryParams,
            labels,
        ),
        "GetAuthorizedPartiesRefused",
    );

    /** @type {ProblemDetails|null} */
    let problem = null;

    const refused = check(res, {
        [`GetAuthorizedPartiesRefused - status code is ${expectedStatus}`]: (r) =>
            r.status === expectedStatus,
    });

    if (!refused) {
        console.log(res.status);
        console.log(res.body);

        return problem;
    }

    // A refusal does not have to carry a problem body, and an empty one is not a
    // failure of the refusal itself, so this only reports what came back.
    try {
        problem = JSON.parse(res.body);
    } catch (err) {
        problem = null;
    }

    return problem;
}
