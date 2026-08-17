export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: The access information flags decide what is populated, not which parties are returned
//
//   When every access information flag is on, the access collections carry data
//   When every flag is off, the same parties come back with all four collections empty

export default function (data) {
    const [authorizedPartiesClient] = getClients();

    const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
    const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
    const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

    // WHEN every access information flag is on, the access collections carry data:
    // the client organisation is held through the accountant role with the accountant
    // packages.
    group("01 WHEN all access information is requested", function () {
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles()
            .includeAccessPackages()
            .includeResources()
            .includeInstances()
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, client.partyUuid, `the client ${client.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyIncludesRole(parties, client.partyUuid, "regnskapsforer");
        AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(parties, client.partyUuid, "access packages are populated when requested");
    });

    // WHEN every access information flag is off, the parties are still returned but
    // all four access collections are empty on every party in the tree.
    group("02 WHEN no access information is requested", function () {
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles(false)
            .includeAccessPackages(false)
            .includeResources(false)
            .includeInstances(false)
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.partyUuid, `the accounting firm ${firm.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, client.partyUuid, `the client ${client.name}`);
        AuthorizedPartiesDomainChecks.CheckEveryPartyHasNoAccessInformation(parties);
    });
}
