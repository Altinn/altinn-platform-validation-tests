export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties, GetAuthorizedPartiesRefused } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getAdminClient, getClients, OTHER_SERVICE_OWNER_ORG_CODE } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Which org code a caller may ask on behalf of depends on its scope. A service owner may
// filter on its own, is refused another service owner's, and the admin scope is allowed
// that same code.
//
// This filter only exists on the service owner surface, since a plain resource owner is
// limited to the org code it owns.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Which org code a caller may ask on behalf of depends on its scope", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const ownOrgCode = data.sharedTestData.serviceOwners.digdir.org;
        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

        const filteredOnOrgCode = (orgCode) => new AuthorizedPartiesQueryBuilder()
            .includeAccessPackages()
            .withOrgCode(orgCode)
            .build();

        group("A service owner may filter on the org code it owns", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, filteredOnOrgCode(ownOrgCode));

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
