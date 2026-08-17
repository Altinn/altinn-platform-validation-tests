export { handleSummary } from "../../../../../bdd-summary.js";
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

    group("WHEN every access information flag is on", function () {
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles()
            .includeAccessPackages()
            .includeResources()
            .includeInstances()
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIncludesRole(
            "THEN the client party carries the accountant role it is held through",
            parties, client.partyUuid, "regnskapsforer");

        AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(
            "AND the client party carries access packages",
            parties, client.partyUuid);
    });

    group("WHEN every access information flag is off", function () {
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles(false)
            .includeAccessPackages(false)
            .includeResources(false)
            .includeInstances(false)
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
            "THEN the accounting firm is still returned",
            parties, firm.partyUuid);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
            "AND the client organisation is still returned",
            parties, client.partyUuid);

        AuthorizedPartiesDomainChecks.CheckEveryPartyHasNoAccessInformation(
            "AND every party has empty roles, packages, resources and instances",
            parties);
    });
}
