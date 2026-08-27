export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// The party filter narrows the list without ever widening it. Filtering on a client main
// unit returns that unit alone, without its subunits; filtering on a subunit returns it
// nested under a main unit that carries no access of its own; filtering on a party the
// subject cannot access returns an empty list.
//
// On this endpoint the party filter goes in the request body. A partyFilter query
// parameter is silently ignored here, unlike on the enduser endpoint.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("The party filter narrows the list without ever widening it", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
        const unreachable = data.testdata.idportenEmailUser;

        const queryParams = new AuthorizedPartiesQueryBuilder().includeAccessPackages().build();

        const filteredOn = (/** @type {string} */ partyUuid) => new AuthorizedPartiesRequestBuilder()
            .withPerson(firm.dagligleder.pid)
            .withPartyUuidFilter(partyUuid)
            .build();

        group("Filtering on a main unit returns that unit alone", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(client.partyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(parties, [client.partyUuid]);

            AuthorizedPartiesDomainChecks.CheckPartyHasNoSubunits(parties, client.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(parties, client.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(parties, client.partyUuid);
        });

        group("Filtering on a subunit returns it nested under its main unit", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(client.subunit.partyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(parties, client.subunit.partyUuid);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(parties, [client.partyUuid]);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, client.partyUuid, client.subunit.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOnlyHierarchyElement(parties, client.partyUuid);
        });

        group("Filtering never widens what the subject may see", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(unreachable.partyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsEmptyPartyArray(parties);
        });
    });
}
