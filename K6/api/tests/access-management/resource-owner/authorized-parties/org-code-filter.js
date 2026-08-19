export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getAdminClient, getClients, OTHER_SERVICE_OWNER_ORG_CODE } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Feature: Which org code a caller may ask on behalf of depends on its scope
//
//   When a service owner filters on its own org code, the request succeeds
//   When it filters on another service owner's org code, the request is refused
//   And the admin scope is allowed that same org code
//
// This filter only exists on the service owner surface, since a plain resource owner is
// limited to the org code it owns.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Feature: Which org code a caller may ask on behalf of depends on its scope", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const ownOrgCode = data.sharedTestData.serviceOwners.digdir.org;
        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

        const filteredOnOrgCode = (orgCode) => new AuthorizedPartiesQueryBuilder()
            .includeAccessPackages()
            .withOrgCode(orgCode)
            .build();

        scenario({
            name: "A service owner may filter on the org code it owns",
            given: "a service owner calling with the resource owner scope",
            when: "it lists the parties filtered on its own org code",
        }, function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, filteredOnOrgCode(ownOrgCode));

            AuthorizedPartiesDomainChecks.CheckResponseIsPartyArray(
                parties,
                "THEN a narrowed party list comes back");
        });

        scenario({
            name: "A resource owner may not filter on an org code it does not own",
            given: "a service owner calling with only the resource owner scope",
            when: "it lists the parties filtered on another service owner's org code",
        }, function () {
            // The building block asserts 200, so this refusal goes straight to the client.
            const response = authorizedPartiesClient.GetAuthorizedParties(request, filteredOnOrgCode(OTHER_SERVICE_OWNER_ORG_CODE));

            AuthorizedPartiesDomainChecks.CheckBadRequest(
                response,
                "THEN the request is refused with 400");

            AuthorizedPartiesDomainChecks.CheckProblemBodyMentions(
                response, OTHER_SERVICE_OWNER_ORG_CODE,
                "AND the problem body names the org code that was refused");
        });

        scenario({
            name: "The admin scope may filter on any org code",
            given: "a caller with the authorized parties admin scope",
            when: "it lists the parties filtered on another service owner's org code",
        }, function () {
            const parties = GetAuthorizedParties(getAdminClient(), request, filteredOnOrgCode(OTHER_SERVICE_OWNER_ORG_CODE));

            AuthorizedPartiesDomainChecks.CheckResponseIsPartyArray(
                parties,
                "THEN the request succeeds");
        });
    });
}
