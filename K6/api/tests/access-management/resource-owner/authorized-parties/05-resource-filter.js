export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: The resource filter narrows both the parties and the access shown on them
//
//   When filtering on a resource the subject holds, the party carrying it comes back
//     with only that resource, and a party reached without it drops out
//   When the subject does not hold the resource at all, nothing carrying it comes back
//
// anyOfResourceIds is a query parameter on this endpoint, unlike the party filter.

export default function (data) {
    const [authorizedPartiesClient] = getClients();

    const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
    const resourceHolder = firm.client_rightholderOrg2;
    const otherClient = firm.client_USENSUELL_UVIRKSOM_TIGER;
    const resourceId = resourceHolder.resourceIdDelegatedToPerson;

    const queryParams = new AuthorizedPartiesQueryBuilder()
        .includeResources()
        .addResourceId(resourceId)
        .build();

    // WHEN the list is filtered on a single resource the subject holds on one client,
    // that client is returned and the only resource left on it is the one filtered on.
    // A client the subject reaches without that resource drops out.
    group("01 WHEN filtering on a resource the subject holds", function () {
        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, resourceHolder.partyUuid, `the client ${resourceHolder.name} that carries the filtered resource`);
        AuthorizedPartiesDomainChecks.CheckPartyHasExactlyResources(parties, resourceHolder.partyUuid, [resourceId]);
        AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, otherClient.partyUuid, "the accountant client does not carry the filtered resource");
    });

    // WHEN the subject is an employee who holds packages on the firm but not the filtered
    // resource, the client that carries that resource for another person is not returned,
    // and no returned party carries the filtered resource.
    group("02 WHEN the subject does not hold the resource", function () {
        const request = new AuthorizedPartiesRequestBuilder()
            .withPerson(firm.employee_rightholderWithPackages.pid)
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, resourceHolder.partyUuid, "the rightholder client is not reachable for this subject");
        AuthorizedPartiesDomainChecks.CheckNoPartyCarriesResource(parties, resourceId);
    });
}
