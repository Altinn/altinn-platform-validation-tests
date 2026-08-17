export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getAdminClient, getClients, getNoTokenClient, getWrongScopeClient } from "./common.js";

// Scenario: The endpoint only answers callers the resource owner policy accepts
//
//   When the request carries no token, it is rejected before any lookup
//   When the token's scope is not one the policy accepts, it is rejected
//   And the resource owner scope grants access
//   And the admin scope grants access too
//
// The negative steps call the client directly rather than going through the
// GetAuthorizedParties building block, which asserts 200 and would register a
// failing check for every request that is meant to be refused.

export default function (data) {
    const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
    const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();
    const queryParams = new AuthorizedPartiesQueryBuilder().build();

    // WHEN the request carries no token, the endpoint rejects it with 401 before
    // any lookup happens.
    group("01 WHEN no token is provided THEN the request fails", function () {
        const response = getNoTokenClient().GetAuthorizedParties(request, queryParams);

        AuthorizedPartiesDomainChecks.CheckUnauthorized(response, "a request with no token");
    });

    // WHEN the caller presents a valid enterprise token whose scope the policy
    // does not accept, the request fails with 403. Authentication succeeds,
    // authorization does not.
    group("02 WHEN the scope is insufficient THEN the request fails", function () {
        const response = getWrongScopeClient().GetAuthorizedParties(request, queryParams);

        AuthorizedPartiesDomainChecks.CheckForbidden(response, "a token carrying a scope the policy does not accept");
    });

    // AND the resource owner scope is one the policy accepts, so the same request
    // succeeds.
    group("03 AND the resource owner scope grants access", function () {
        const [authorizedPartiesClient] = getClients();
        const response = authorizedPartiesClient.GetAuthorizedParties(request, queryParams);

        AuthorizedPartiesDomainChecks.CheckRequestSucceeded(response, "the resource owner scope");
    });

    // AND the admin scope is the other scope the policy accepts, so the same
    // request succeeds with it too.
    group("04 AND the admin scope grants access", function () {
        const response = getAdminClient().GetAuthorizedParties(request, queryParams);

        AuthorizedPartiesDomainChecks.CheckRequestSucceeded(response, "the admin scope");
    });
}
