export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: The party filter narrows the list without ever widening it
//
//   When filtering on a client main unit, only that main unit comes back, without subunits
//   When filtering on a subunit, it comes back nested under its main unit, which carries no access
//   When filtering on a party the subject cannot access, the list is empty
//
// On this endpoint the party filter goes in the request body. A partyFilter query
// parameter is silently ignored here, unlike on the enduser endpoint.

export default function (data) {
    const [authorizedPartiesClient] = getClients();

    const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
    const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
    const unreachable = data.testdata.idportenEmailUser;

    const queryParams = new AuthorizedPartiesQueryBuilder().includeAccessPackages().build();

    // WHEN the subject's list is filtered on a client main unit, only that main unit is
    // returned. Its subunits are not pulled in, since the filter is on the party and not
    // on the hierarchy.
    group("01 WHEN filtering on a client main unit", function () {
        const request = new AuthorizedPartiesRequestBuilder()
            .withPerson(firm.dagligleder.pid)
            .withPartyUuidFilter(client.partyUuid)
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(parties, [client.partyUuid]);
        AuthorizedPartiesDomainChecks.CheckPartyHasNoSubunits(parties, client.partyUuid, "a main unit filter returns the main unit without its subunits");
        AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(parties, client.partyUuid);
        AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(parties, client.partyUuid, "the client is held with the accountant packages");
    });

    // WHEN the filter is on a subunit, the subunit is returned nested under its main
    // unit, since a subunit is never returned at the top level. The main unit itself is
    // only a hierarchy carrier with no access information of its own.
    group("02 WHEN filtering on a subunit", function () {
        const request = new AuthorizedPartiesRequestBuilder()
            .withPerson(firm.dagligleder.pid)
            .withPartyUuidFilter(client.subunit.partyUuid)
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(parties, client.subunit.partyUuid);
        AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(parties, [client.partyUuid]);
        AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, client.partyUuid, client.subunit.partyUuid, `the subunit ${client.subunit.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyIsOnlyHierarchyElement(parties, client.partyUuid);
    });

    // WHEN the filter is on the uuid of a party the subject has no access to, the request
    // still succeeds and the party list is empty. Filtering never widens what the subject
    // may see.
    group("03 WHEN filtering on a party the subject cannot access", function () {
        const request = new AuthorizedPartiesRequestBuilder()
            .withPerson(firm.dagligleder.pid)
            .withPartyUuidFilter(unreachable.partyUuid)
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckResponseIsEmptyPartyArray(parties, "the subject has no access to the filtered party");
    });
}
