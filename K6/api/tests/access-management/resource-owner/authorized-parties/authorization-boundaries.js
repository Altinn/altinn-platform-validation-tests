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
// Every step here calls the client directly rather than going through the
// GetAuthorizedParties building block, which asserts 200 and would register a failing
// check for every request that is meant to be refused.

export default function (data) {
    const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
    const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();
    const queryParams = new AuthorizedPartiesQueryBuilder().build();

    group("WHEN the request carries no token", function () {
        const response = getNoTokenClient().GetAuthorizedParties(request, queryParams);

        AuthorizedPartiesDomainChecks.CheckUnauthorized(
            "THEN the endpoint rejects it with 401 before any lookup",
            response);
    });

    group("WHEN the caller presents a valid token whose scope the policy does not accept", function () {
        const response = getWrongScopeClient().GetAuthorizedParties(request, queryParams);

        AuthorizedPartiesDomainChecks.CheckForbidden(
            "THEN the request fails with 403, since authentication succeeded and authorization did not",
            response);
    });

    group("WHEN the caller presents the resource owner scope", function () {
        const [authorizedPartiesClient] = getClients();
        const response = authorizedPartiesClient.GetAuthorizedParties(request, queryParams);

        AuthorizedPartiesDomainChecks.CheckRequestSucceeded(
            "THEN the request succeeds, because the policy accepts that scope",
            response);
    });

    group("WHEN the caller presents the admin scope", function () {
        const response = getAdminClient().GetAuthorizedParties(request, queryParams);

        AuthorizedPartiesDomainChecks.CheckRequestSucceeded(
            "THEN the request succeeds too, because it is the other scope the policy accepts",
            response);
    });
}
