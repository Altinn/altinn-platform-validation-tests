export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Feature: A business manager's daily leader reaches the housing companies the firm manages
//
//   When the subject is the daily leader of a forretningsfører firm
//   Then the client the firm holds the eiendom package for carries that package
//   And the other housing company client is also returned

export default function (data) {
    group("Feature: A business manager's daily leader reaches the housing companies the firm manages", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.forretningsforerNonfigurativEmosjonellPuma;

        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles()
            .includeAccessPackages()
            .build();

        group("WHEN the subject is the daily leader of a business manager firm", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                "THEN the housing company the firm manages is returned",
                parties, firm.esekClient.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                "AND it carries the eiendom package the firm holds for it",
                parties, firm.esekClient.partyUuid, [firm.esekClient.clientPackage]);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                "AND the other housing company client is also returned",
                parties, firm.nonBrlEsekClient.partyUuid);
        });
    });
}
