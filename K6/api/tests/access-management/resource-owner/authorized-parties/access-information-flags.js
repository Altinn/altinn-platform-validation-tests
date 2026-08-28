export { handleSummary } from "../../../../../common-imports.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { fetchTestData, getItemFromList, requireEnv } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { AccessInformationFlagsSetupData } from "./setup-data.types.js";

// The access information flags decide what is populated, not which parties are returned.
// With every flag on the access collections carry data; with every flag off the same
// parties come back with all four collections empty.

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Runs the feature.
 *
 * @param {AccessInformationFlagsSetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("The access information flags decide what is populated, not which parties are returned", function () {
        const [authorizedPartiesClient] = getClients();

        const row = getItemFromList(data.accessInformationFlags, randomize);

        const request = new AuthorizedPartiesRequestBuilder().withPerson(row.pid).build();

        group("The flags populate the access collections", function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeRoles()
                .includeAccessPackages()
                .includeResources()
                .includeInstances()
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesRole(parties, row.clientPartyUuid, "regnskapsforer");

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccessPackages(parties, row.clientPartyUuid);
        });

        group("The flags do not decide which parties are returned", function () {
            const queryParams = new AuthorizedPartiesQueryBuilder()
                .includeRoles(false)
                .includeAccessPackages(false)
                .includeResources(false)
                .includeInstances(false)
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, row.firmPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, row.clientPartyUuid);

            AuthorizedPartiesDomainChecks.CheckEveryPartyHasNoAccessInformation(parties);
        });
    });
}

/**
 * Fetches the rows this scenario draws from.
 *
 * @returns {AccessInformationFlagsSetupData} The rows, as the default function's `data` argument.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return {
        accessInformationFlags: fetchTestData(`access-management/resource-owner/authorized-parties/access-information-flags/${__ENV.ENVIRONMENT}.csv`),
    };
}
