export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// The resource filter narrows both the parties and the access shown on them. Filtering on
// a resource the subject holds returns the party carrying it with only that resource, and
// drops a party reached without it. A subject that does not hold the resource at all gets
// nothing carrying it.
//
// anyOfResourceIds is a query parameter on this endpoint, unlike the party filter.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("The resource filter narrows both the parties and the access shown on them", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const resourceHolder = firm.client_rightholderOrg2;
        const otherClient = firm.client_USENSUELL_UVIRKSOM_TIGER;
        const resourceId = resourceHolder.resourceIdDelegatedToPerson;

        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeResources()
            .addResourceId(resourceId)
            .build();

        group("Filtering on a resource narrows the parties and their resources", function () {
            const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, resourceHolder.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHasExactlyResources(parties, resourceHolder.partyUuid, [resourceId]);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, otherClient.partyUuid);
        });

        group("Filtering on a resource the subject does not hold returns nothing carrying it", function () {
            const request = new AuthorizedPartiesRequestBuilder()
                .withPerson(firm.employee_rightholderWithPackages.pid)
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, resourceHolder.partyUuid);

            AuthorizedPartiesDomainChecks.CheckNoPartyCarriesResource(parties, resourceId);
        });
    });
}
