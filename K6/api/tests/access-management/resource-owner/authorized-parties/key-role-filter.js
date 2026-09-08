export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Excluding key role parties drops what the subject only reaches through a firm. With
// them included the firm's clients are in the list; with them excluded those clients drop
// out, while the firm itself stays and so does a party that delegated to the person
// directly.
//
// includeSubParties is not covered here: the filter is resolved but never applied,
// tracked by #3522. The inactive window is covered by the deleted parties test.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Excluding key role parties drops what the subject only reaches through a firm", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
        const clientWithoutDelegation = firm.client_WITHOUT_CLIENTDELEGATION;
        const directDelegator = firm.client_rightholderOrg2;

        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

        group("Key role parties are included by default", function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeAccessPackages()
                .includePartiesViaKeyRoles("true")
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, client.partyUuid);
        });

        group("Excluding key role parties drops what only the firm reaches", function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeAccessPackages()
                .includePartiesViaKeyRoles("false")
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, client.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, clientWithoutDelegation.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, directDelegator.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, directDelegator.partyUuid, [directDelegator.packageDelegatedToPerson]);
        });
    });
}
