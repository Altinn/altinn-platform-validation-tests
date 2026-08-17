export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Feature: The resource filter narrows both the parties and the access shown on them
//
//   When filtering on a resource the subject holds, the party carrying it comes back
//     with only that resource, and a party reached without it drops out
//   When the subject does not hold the resource at all, nothing carrying it comes back
//
// anyOfResourceIds is a query parameter on this endpoint, unlike the party filter.

export default function (data) {
    group("Feature: The resource filter narrows both the parties and the access shown on them", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const resourceHolder = firm.client_rightholderOrg2;
        const otherClient = firm.client_USENSUELL_UVIRKSOM_TIGER;
        const resourceId = resourceHolder.resourceIdDelegatedToPerson;

        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeResources()
            .addResourceId(resourceId)
            .build();

        scenario({
            name: "Filtering on a resource narrows the parties and their resources",
            given: [
                "one client has a resource delegated to the subject",
                "another client the subject reaches does not have it",
            ],
            when: "a service owner lists the parties filtered on that one resource",
        }, function () {
            const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                "THEN the client that carries the filtered resource is returned",
                parties, resourceHolder.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHasExactlyResources(
                "AND the only resource left on it is the one filtered on",
                parties, resourceHolder.partyUuid, [resourceId]);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
                "AND a client the subject reaches without that resource drops out",
                parties, otherClient.partyUuid);
        });

        scenario({
            name: "Filtering on a resource the subject does not hold returns nothing carrying it",
            given: "an employee who holds packages on the firm but not the filtered resource",
            when: "a service owner lists that employee's parties filtered on the resource",
        }, function () {
            const request = new AuthorizedPartiesRequestBuilder()
                .withPerson(firm.employee_rightholderWithPackages.pid)
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
                "THEN the client that carries that resource for another person is not returned",
                parties, resourceHolder.partyUuid);

            AuthorizedPartiesDomainChecks.CheckNoPartyCarriesResource(
                "AND no returned party carries the filtered resource",
                parties, resourceId);
        });
    });
}
