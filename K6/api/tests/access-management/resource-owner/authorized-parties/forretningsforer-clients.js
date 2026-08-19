export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Feature: A business manager's daily leader reaches the housing companies the firm manages
//
//   When the subject is the daily leader of a forretningsfører firm
//   Then the client the firm holds the eiendom package for carries that package
//   And the other housing company client is also returned

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Feature: A business manager's daily leader reaches the housing companies the firm manages", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.forretningsforerNonfigurativEmosjonellPuma;

        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles()
            .includeAccessPackages()
            .build();

        scenario({
            name: "A business manager's daily leader reaches the housing companies it manages",
            given: [
                "a business manager firm that manages two housing companies",
                "the firm holds the eiendom package for one of them",
            ],
            when: "a service owner lists the authorized parties of the firm's daily leader",
        }, function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                parties, firm.esekClient.partyUuid,
                "THEN the housing company the firm manages is returned");

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                parties, firm.esekClient.partyUuid, [firm.esekClient.clientPackage],
                "AND it carries the eiendom package the firm holds for it");

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                parties, firm.nonBrlEsekClient.partyUuid,
                "AND the other housing company client is also returned");
        });
    });
}
