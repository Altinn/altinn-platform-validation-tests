export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Feature: The access information flags decide what is populated, not which parties are returned
//
//   When every access information flag is on, the access collections carry data
//   When every flag is off, the same parties come back with all four collections empty

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Feature: The access information flags decide what is populated, not which parties are returned", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

        scenario({
            name: "The flags populate the access collections",
            given: "a client organisation the subject reaches through the accountant role",
            when: "a service owner lists the parties with every access information flag on",
        }, function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeRoles()
                .includeAccessPackages()
                .includeResources()
                .includeInstances()
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesRole(
                "THEN the client party carries the accountant role",
                parties, client.partyUuid, "regnskapsforer");

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(
                "AND the client party carries access packages",
                parties, client.partyUuid);
        });

        scenario({
            name: "The flags do not decide which parties are returned",
            given: "a client organisation the subject reaches through the accountant role",
            when: "a service owner lists the parties with every access information flag off",
        }, function () {
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
                "AND no party carries any access information",
                parties);
        });
    });
}
