export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: Excluding key role parties drops what the subject only reaches through a firm
//
//   Given key role parties are included, the firm's clients are part of the list
//   When key role parties are excluded, those clients drop out
//   And the firm itself stays, and so does a party that delegated to the person directly
//
// includeSubParties is not covered here: the filter is resolved but never applied,
// tracked by #3522. The inactive window is covered by the deleted parties scenario.

export default function (data) {
    const [authorizedPartiesClient] = getClients();

    const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
    const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
    const clientWithoutDelegation = firm.client_WITHOUT_CLIENTDELEGATION;
    const directDelegator = firm.client_rightholderOrg2;

    const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

    // GIVEN key role parties are included, the clients the subject reaches through the
    // accounting firm's key role are part of the list. This is the baseline the exclude
    // step is compared against.
    group("01 GIVEN key role parties are included", function () {
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeAccessPackages()
            .includePartiesViaKeyRoles("true")
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, client.partyUuid, `the accountant client ${client.name}, reachable via the key role`);
    });

    // WHEN key role parties are excluded, the clients the subject only reaches because
    // the accounting firm has access to them drop out. The firm itself stays, and so
    // does a party that delegated something to the person directly.
    group("02 WHEN key role parties are excluded", function () {
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeAccessPackages()
            .includePartiesViaKeyRoles("false")
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, client.partyUuid, "the accountant client is only reachable through the key role");
        AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, clientWithoutDelegation.partyUuid, "the client without a client delegation is only reachable through the key role");
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.partyUuid, `the firm ${firm.name} the subject is daily leader for`);
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, directDelegator.partyUuid, `${directDelegator.name}, which delegated directly to the person`);
        AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, directDelegator.partyUuid, [directDelegator.packageDelegatedToPerson]);
    });
}
