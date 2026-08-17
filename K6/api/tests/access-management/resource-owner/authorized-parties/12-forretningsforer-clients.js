export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: A business manager's daily leader reaches the housing companies the firm manages
//
//   When the subject is the daily leader of a forretningsfører firm
//   Then the client the firm holds the eiendom package for carries that package
//   And the other housing company client is also returned

export default function (data) {
    const [authorizedPartiesClient] = getClients();

    const firm = data.testdata.forretningsforerNonfigurativEmosjonellPuma;

    const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();
    const queryParams = new AuthorizedPartiesQueryBuilder()
        .includeRoles()
        .includeAccessPackages()
        .build();

    // WHEN the subject is the daily leader of a business manager firm, the housing company
    // clients the firm manages are returned, and the client the firm holds the eiendom
    // package for carries that package.
    group("01 WHEN the subject is a business manager's daily leader", function () {
        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.esekClient.partyUuid, `the client ${firm.esekClient.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, firm.esekClient.partyUuid, [firm.esekClient.clientPackage]);
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.nonBrlEsekClient.partyUuid, `the other housing company client ${firm.nonBrlEsekClient.name}`);
    });
}
