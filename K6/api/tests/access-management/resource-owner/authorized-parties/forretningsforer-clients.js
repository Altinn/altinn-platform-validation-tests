export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// A business manager's daily leader reaches the housing companies the firm manages. The
// client the firm holds the eiendom package for carries that package, and the other
// housing company client is returned too.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("A business manager's daily leader reaches the housing companies the firm manages", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.forretningsforerNonfigurativEmosjonellPuma;

        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles()
            .includeAccessPackages()
            .build();

        group("A business manager's daily leader reaches the housing companies it manages", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.esekClient.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, firm.esekClient.partyUuid, [firm.esekClient.clientPackage]);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.nonBrlEsekClient.partyUuid);
        });
    });
}
