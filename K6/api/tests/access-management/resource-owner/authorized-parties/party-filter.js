export { handleSummary } from "../../../../../common-imports.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { fetchTestData, getItemFromList, requireEnv } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { PartyFilterSetupData } from "./setup-data.types.js";

// The party filter narrows the list without ever widening it. Filtering on a client main
// unit returns that unit alone, without its subunits; filtering on a subunit returns it
// nested under a main unit that carries no access of its own; filtering on a party the
// subject cannot access returns an empty list.
//
// On this endpoint the party filter goes in the request body. A partyFilter query
// parameter is silently ignored here, unlike on the enduser endpoint.

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Runs the feature.
 *
 * @param {PartyFilterSetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("The party filter narrows the list without ever widening it", function () {
        const [authorizedPartiesClient] = getClients();

        const row = getItemFromList(data.partyFilter, randomize);

        const queryParams = new AuthorizedPartiesQueryBuilder().includeAccessPackages().build();

        const filteredOn = (/** @type {string} */ partyUuid) => new AuthorizedPartiesRequestBuilder()
            .withPerson(row.pid)
            .withPartyUuidFilter(partyUuid)
            .build();

        group("Filtering on a main unit returns that unit alone", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(row.clientPartyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(parties, [row.clientPartyUuid]);

            AuthorizedPartiesDomainChecks.CheckPartyHasNoSubunits(parties, row.clientPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(parties, row.clientPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(parties, row.clientPartyUuid);
        });

        group("Filtering on a subunit returns it nested under its main unit", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(row.clientSubunitPartyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(parties, row.clientSubunitPartyUuid);

            AuthorizedPartiesDomainChecks.CheckOnlyTheseTopLevelParties(parties, [row.clientPartyUuid]);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, row.clientPartyUuid, row.clientSubunitPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOnlyHierarchyElement(parties, row.clientPartyUuid);
        });

        group("Filtering never widens what the subject may see", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, filteredOn(row.unreachablePartyUuid), queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsEmptyPartyArray(parties);
        });
    });
}

/**
 * Fetches the rows this scenario draws from.
 *
 * @returns {PartyFilterSetupData} The rows, as the default function's `data` argument.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return {
        partyFilter: fetchTestData(`access-management/resource-owner/authorized-parties/party-filter/${__ENV.ENVIRONMENT}.csv`, true, "test/subject-lookup-forms-from-csv"),
    };
}
