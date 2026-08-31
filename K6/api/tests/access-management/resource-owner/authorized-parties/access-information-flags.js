export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// The access information flags decide what is populated, not which parties are returned.
// With every flag on the access collections carry data; with every flag off the same
// parties come back with all four collections empty.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("The access information flags decide what is populated, not which parties are returned", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

        group("The flags populate the access collections", function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeRoles()
                .includeAccessPackages()
                .includeResources()
                .includeInstances()
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesRole(parties, client.partyUuid, "regnskapsforer");

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(parties, client.partyUuid);
        });

        group("The flags do not decide which parties are returned", function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeRoles(false)
                .includeAccessPackages(false)
                .includeResources(false)
                .includeInstances(false)
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, client.partyUuid);

            AuthorizedPartiesDomainChecks.CheckEveryPartyHasNoAccessInformation(parties);
        });
    });
}
