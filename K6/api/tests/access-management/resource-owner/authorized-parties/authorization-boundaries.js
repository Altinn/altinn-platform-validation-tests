export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getAdminClient, getClients, getNoTokenClient, getWrongScopeClient } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Feature: The endpoint only answers callers the resource owner policy accepts
//
//   When the request carries no token, it is rejected before any lookup
//   When the token's scope is not one the policy accepts, it is rejected
//   And the resource owner scope grants access
//   And the admin scope grants access too
//
// Every step here calls the client directly rather than going through the
// GetAuthorizedParties building block, which asserts 200 and would register a failing
// check for every request that is meant to be refused.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Feature: The endpoint only answers callers the resource owner policy accepts", function () {
        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();
        const queryParams = new AuthorizedPartiesQueryBuilder().build();

        scenario({
            name: "An unauthenticated request is refused",
            given: "no token at all",
            when: "a caller lists authorized parties",
        }, function () {
            const response = getNoTokenClient().GetAuthorizedParties(request, queryParams);

            AuthorizedPartiesDomainChecks.CheckUnauthorized(
                "THEN the request is refused with 401",
                response);
        });

        scenario({
            name: "A valid token with the wrong scope is refused",
            given: "a valid enterprise token carrying a scope this policy does not accept",
            when: "a caller lists authorized parties",
        }, function () {
            const response = getWrongScopeClient().GetAuthorizedParties(request, queryParams);

            AuthorizedPartiesDomainChecks.CheckForbidden(
                "THEN the request is refused with 403",
                response);
        });

        scenario({
            name: "The resource owner scope is accepted",
            given: "a valid enterprise token carrying the authorized parties resource owner scope",
            when: "a caller lists authorized parties",
        }, function () {
            const [authorizedPartiesClient] = getClients();
            const response = authorizedPartiesClient.GetAuthorizedParties(request, queryParams);

            AuthorizedPartiesDomainChecks.CheckRequestSucceeded(
                "THEN the request succeeds",
                response);
        });

        scenario({
            name: "The admin scope is accepted",
            given: "a valid enterprise token carrying the authorized parties admin scope",
            when: "a caller lists authorized parties",
        }, function () {
            const response = getAdminClient().GetAuthorizedParties(request, queryParams);

            AuthorizedPartiesDomainChecks.CheckRequestSucceeded(
                "THEN the request succeeds",
                response);
        });
    });
}
