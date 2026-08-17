export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Feature: Excluding key role parties drops what the subject only reaches through a firm
//
//   Given key role parties are included, the firm's clients are part of the list
//   When key role parties are excluded, those clients drop out
//   And the firm itself stays, and so does a party that delegated to the person directly
//
// includeSubParties is not covered here: the filter is resolved but never applied,
// tracked by #3522. The inactive window is covered by the deleted parties scenario.

export default function (data) {
    group("Feature: Excluding key role parties drops what the subject only reaches through a firm", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
        const clientWithoutDelegation = firm.client_WITHOUT_CLIENTDELEGATION;
        const directDelegator = firm.client_rightholderOrg2;

        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

        group("WHEN the parties are listed with key role parties included", function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeAccessPackages()
                .includePartiesViaKeyRoles("true")
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                "THEN a client reached through the firm's key role is in the list",
                parties, client.partyUuid);
        });

        group("WHEN key role parties are excluded", function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeAccessPackages()
                .includePartiesViaKeyRoles("false")
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
                "THEN the accountant client is gone",
                parties, client.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
                "AND the client without a client delegation is gone",
                parties, clientWithoutDelegation.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                "AND the firm the subject is daily leader for is still returned",
                parties, firm.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                "AND a party that delegated directly to the person is still returned",
                parties, directDelegator.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                "AND that party still carries the package delegated to the person",
                parties, directDelegator.partyUuid, [directDelegator.packageDelegatedToPerson]);
        });
    });
}
