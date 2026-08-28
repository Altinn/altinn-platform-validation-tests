export { handleSummary } from "../../../../../common-imports.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { fetchTestData, getItemFromList, requireEnv } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { ResourceFilterSetupData } from "./setup-data.types.js";

// The resource filter narrows both the parties and the access shown on them. Filtering on
// a resource the subject holds returns the party carrying it with only that resource, and
// drops a party reached without it. A subject that does not hold the resource at all gets
// nothing carrying it.
//
// anyOfResourceIds is a query parameter on this endpoint, unlike the party filter.

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Runs the feature.
 *
 * @param {ResourceFilterSetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("The resource filter narrows both the parties and the access shown on them", function () {
        const [authorizedPartiesClient] = getClients();

        const row = getItemFromList(data.resourceFilter, randomize);

        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeResources()
            .addResourceId(row.resourceId)
            .build();

        group("Filtering on a resource narrows the parties and their resources", function () {
            const request = new AuthorizedPartiesRequestBuilder().withPerson(row.pid).build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, row.resourceHolderPartyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyHasExactlyResources(parties, row.resourceHolderPartyUuid, [row.resourceId]);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, row.clientPartyUuid);
        });

        group("Filtering on a resource the subject does not hold returns nothing carrying it", function () {
            const request = new AuthorizedPartiesRequestBuilder()
                .withPerson(row.pidWithoutResource)
                .build();

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, row.resourceHolderPartyUuid);

            AuthorizedPartiesDomainChecks.CheckNoPartyCarriesResource(parties, row.resourceId);
        });
    });
}

/**
 * Fetches the rows this scenario draws from.
 *
 * Only tt02 and yt01 have a file: an accounting firm picked out of Enhetsregisteret holds
 * no resources unless somebody delegated one, and in at22 and at23 nobody has. The
 * environments this runs in are listed in functional.yaml.
 *
 * @returns {ResourceFilterSetupData} The rows, as the default function's `data` argument.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return {
        resourceFilter: fetchTestData(`access-management/resource-owner/authorized-parties/resource-filter/${__ENV.ENVIRONMENT}.csv`),
    };
}
