export { handleSummary } from "../../../../../common-imports.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { fetchTestData, getItemFromList, requireEnv } from "../../../../../helpers.js";
import { GetAuthorizedParties, GetAuthorizedPartiesRefused } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/index.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getAdminClient, getClients, OTHER_SERVICE_OWNER_ORG_CODE, OWN_SERVICE_OWNER_ORG_CODE } from "./common.js";
import { OrgCodeFilterSetupData } from "./setup-data.types.js";

// Which org code a caller may ask on behalf of depends on its scope. A service owner may
// filter on its own, is refused another service owner's, and the admin scope is allowed
// that same code.
//
// This filter only exists on the service owner surface, since a plain resource owner is
// limited to the org code it owns.
//
// The subject is incidental here too: the same lookup is sent three times and only the
// org code and the scope change.

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Runs the feature.
 *
 * @param {OrgCodeFilterSetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Which org code a caller may ask on behalf of depends on its scope", function () {
        const [authorizedPartiesClient] = getClients();

        const row = getItemFromList(data.orgCodeFilter, randomize);

        const request = new AuthorizedPartiesRequestBuilder().withPerson(row.pid).build();

        const filteredOnOrgCode = (/** @type {string} */ orgCode) => new AuthorizedPartiesQueryBuilder()
            .includeAccessPackages()
            .withOrgCode(orgCode)
            .build();

        group("A service owner may filter on the org code it owns", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, filteredOnOrgCode(OWN_SERVICE_OWNER_ORG_CODE));

            AuthorizedPartiesDomainChecks.CheckResponseIsPartyArray(parties);
        });

        group("A resource owner may not filter on an org code it does not own", function () {
            const problem = GetAuthorizedPartiesRefused(authorizedPartiesClient, 400, request, filteredOnOrgCode(OTHER_SERVICE_OWNER_ORG_CODE));

            AuthorizedPartiesDomainChecks.CheckProblemBodyMentions(problem, OTHER_SERVICE_OWNER_ORG_CODE);
        });

        group("The admin scope may filter on any org code", function () {
            const parties = GetAuthorizedParties(getAdminClient(), request, filteredOnOrgCode(OTHER_SERVICE_OWNER_ORG_CODE));

            AuthorizedPartiesDomainChecks.CheckResponseIsPartyArray(parties);
        });
    });
}

/**
 * Fetches the rows this scenario draws from.
 *
 * @returns {OrgCodeFilterSetupData} The rows, as the default function's `data` argument.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return {
        orgCodeFilter: fetchTestData(`access-management/resource-owner/authorized-parties/org-code-filter/${__ENV.ENVIRONMENT}.csv`),
    };
}
