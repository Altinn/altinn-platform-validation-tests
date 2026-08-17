export { handleSummary } from "../../../../../bdd-summary.js";
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
    group("Scenario: The party filter narrows the list without ever widening it", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
        const unreachable = data.testdata.idportenEmailUser;

        const queryParams = new AuthorizedPartiesQueryBuilder().includeAccessPackages().build();

        const filteredOn = (partyUuid) => new AuthorizedPartiesRequestBuilder()
            .withPerson(firm.dagligleder.pid)
            .withPartyUuidFilter(partyUuid)
            .build();

        group("WHEN the subject's list is filtered on a client main unit", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(client.partyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(
                "THEN only the filtered main unit is returned at the top level",
                parties, [client.partyUuid]);

            AuthorizedPartiesDomainChecks.CheckPartyHasNoSubunits(
                "AND its subunits are not pulled in, since the filter is on the party and not the hierarchy",
                parties, client.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(
                "AND the filtered main unit holds access rather than being a hierarchy carrier",
                parties, client.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(
                "AND it carries the access packages the subject holds on it",
                parties, client.partyUuid);
        });

        group("WHEN the subject's list is filtered on a subunit", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(client.subunit.partyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(
                "THEN the subunit is not returned at the top level, since a subunit never is",
                parties, client.subunit.partyUuid);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(
                "AND its main unit is the only top level party",
                parties, [client.partyUuid]);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
                "AND the filtered subunit is nested under that main unit",
                parties, client.partyUuid, client.subunit.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOnlyHierarchyElement(
                "AND the main unit is only a hierarchy carrier with no access of its own",
                parties, client.partyUuid);
        });

        group("WHEN the subject's list is filtered on a party the subject cannot access", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(unreachable.partyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsEmptyPartyArray(
                "THEN the party list is empty, because filtering never widens what the subject may see",
                parties);
        });
    });
}
