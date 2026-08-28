export { handleSummary } from "../../../../../common-imports.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { fetchTestData, getItemFromList, requireEnv } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { KeyRoleFilterSetupData } from "./setup-data.types.js";

// Excluding key role parties drops what the subject only reaches through a firm. With
// them included the firm's clients are in the list; with them excluded those clients drop
// out, while the firm itself stays and so does a party that delegated to the person
// directly.
//
// includeSubParties is not covered here: the filter is resolved but never applied,
// tracked by #3522. The inactive window is covered by the deleted parties test.

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Runs the feature.
 *
 * @param {KeyRoleFilterSetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Excluding key role parties drops what the subject only reaches through a firm", function () {
        const [authorizedPartiesClient] = getClients();

        const row = getItemFromList(data.keyRoleFilter, randomize);

        const request = new AuthorizedPartiesRequestBuilder().withPerson(row.pid).build();

        group("Key role parties are included by default", function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeAccessPackages()
                .includePartiesViaKeyRoles("true")
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, row.clientPartyUuid);
        });

        group("Excluding key role parties drops what only the firm reaches", function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeAccessPackages()
                .includePartiesViaKeyRoles("false")
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, row.clientPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, row.keyRoleOnlyPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, row.firmPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, row.directDelegatorPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, row.directDelegatorPartyUuid, [row.directDelegatorPackage]);
        });
    });
}

/**
 * Fetches the rows this scenario draws from.
 *
 * @returns {KeyRoleFilterSetupData} The rows, as the default function's `data` argument.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return {
        keyRoleFilter: fetchTestData(`access-management/resource-owner/authorized-parties/key-role-filter/${__ENV.ENVIRONMENT}.csv`),
    };
}
