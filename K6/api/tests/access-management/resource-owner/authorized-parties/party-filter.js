export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Feature: The party filter narrows the list without ever widening it
//
//   When filtering on a client main unit, only that main unit comes back, without subunits
//   When filtering on a subunit, it comes back nested under its main unit, which carries no access
//   When filtering on a party the subject cannot access, the list is empty
//
// On this endpoint the party filter goes in the request body. A partyFilter query
// parameter is silently ignored here, unlike on the enduser endpoint.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Feature: The party filter narrows the list without ever widening it", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
        const unreachable = data.testdata.idportenEmailUser;

        const queryParams = new AuthorizedPartiesQueryBuilder().includeAccessPackages().build();

        const filteredOn = (partyUuid) => new AuthorizedPartiesRequestBuilder()
            .withPerson(firm.dagligleder.pid)
            .withPartyUuidFilter(partyUuid)
            .build();

        scenario({
            name: "Filtering on a main unit returns that unit alone",
            given: "a client main unit the subject has access to, which has a subunit",
            when: "a service owner lists the parties filtered on that main unit",
        }, function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(client.partyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(
                parties, [client.partyUuid],
                "THEN only the filtered main unit is returned at the top level");

            AuthorizedPartiesDomainChecks.CheckPartyHasNoSubunits(
                parties, client.partyUuid,
                "AND its subunits are not pulled in");

            AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(
                parties, client.partyUuid,
                "AND the filtered main unit holds access itself");

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(
                parties, client.partyUuid,
                "AND it carries the access packages the subject holds on it");
        });

        scenario({
            name: "Filtering on a subunit returns it nested under its main unit",
            given: "a client subunit the subject has access to",
            when: "a service owner lists the parties filtered on that subunit",
        }, function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(client.subunit.partyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(
                parties, client.subunit.partyUuid,
                "THEN the subunit is not a top level party");

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(
                parties, [client.partyUuid],
                "AND its main unit is the only top level party");

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
                parties, client.partyUuid, client.subunit.partyUuid,
                "AND the filtered subunit is nested under that main unit");

            AuthorizedPartiesDomainChecks.CheckPartyIsOnlyHierarchyElement(
                parties, client.partyUuid,
                "AND the main unit is only a hierarchy carrier with no access of its own");
        });

        scenario({
            name: "Filtering never widens what the subject may see",
            given: "a party the subject has no access to",
            when: "a service owner lists the parties filtered on that party",
        }, function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(unreachable.partyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsEmptyPartyArray(
                parties,
                "THEN the party list is empty");
        });
    });
}
