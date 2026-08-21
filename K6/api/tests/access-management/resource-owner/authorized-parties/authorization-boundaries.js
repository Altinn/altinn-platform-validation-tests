export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getAdminClient, getClients, getNoTokenClient, getWrongScopeClient } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// The endpoint only answers callers the resource owner policy accepts: no token is
// rejected before any lookup, a token whose scope the policy does not accept is rejected
// after authenticating, and both the resource owner and the admin scope are accepted.
//
// Every group here calls the client directly rather than going through the
// GetAuthorizedParties building block, which asserts 200 and would register a failing
// check for every request that is meant to be refused.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("The endpoint only answers callers the resource owner policy accepts", function () {
        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();
        const queryParams = new AuthorizedPartiesQueryBuilder().build();

        group("An unauthenticated request is refused", function () {
            const response = getNoTokenClient().GetAuthorizedParties(request, queryParams);

            AuthorizedPartiesDomainChecks.CheckUnauthorized(response);
        });

        group("A valid token with the wrong scope is refused", function () {
            const response = getWrongScopeClient().GetAuthorizedParties(request, queryParams);

            AuthorizedPartiesDomainChecks.CheckForbidden(response);
        });

        group("The resource owner scope is accepted", function () {
            const [authorizedPartiesClient] = getClients();
            const response = authorizedPartiesClient.GetAuthorizedParties(request, queryParams);

            AuthorizedPartiesDomainChecks.CheckRequestSucceeded(response);
        });

        group("The admin scope is accepted", function () {
            const response = getAdminClient().GetAuthorizedParties(request, queryParams);

            AuthorizedPartiesDomainChecks.CheckRequestSucceeded(response);
        });
    });
}
