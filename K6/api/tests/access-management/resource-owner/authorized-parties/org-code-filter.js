export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getAdminClient, getClients, OTHER_SERVICE_OWNER_ORG_CODE } from "./common.js";

// Feature: Which org code a caller may ask on behalf of depends on its scope
//
//   When a service owner filters on its own org code, the request succeeds
//   When it filters on another service owner's org code, the request is refused
//   And the admin scope is allowed that same org code
//
// This filter only exists on the service owner surface, since a plain resource owner is
// limited to the org code it owns.

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

        group("WHEN a service owner filters on its own org code", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, filteredOnOrgCode(ownOrgCode));

            AuthorizedPartiesDomainChecks.CheckResponseIsPartyArray(
                "THEN a narrowed party list comes back",
                parties);
        });

        group("WHEN a service owner with only the resource owner scope filters on another service owner's org code", function () {
            // The building block asserts 200, so this refusal goes straight to the client.
            const response = authorizedPartiesClient.GetAuthorizedParties(request, filteredOnOrgCode(OTHER_SERVICE_OWNER_ORG_CODE));

            AuthorizedPartiesDomainChecks.CheckBadRequest(
                "THEN the request is refused with 400",
                response);

            AuthorizedPartiesDomainChecks.CheckProblemBodyMentions(
                "AND the problem body names the org code that was refused",
                response, OTHER_SERVICE_OWNER_ORG_CODE);
        });

        group("WHEN the caller has the admin scope and filters on that same org code", function () {
            const parties = GetAuthorizedParties(getAdminClient(), request, filteredOnOrgCode(OTHER_SERVICE_OWNER_ORG_CODE));

            AuthorizedPartiesDomainChecks.CheckResponseIsPartyArray(
                "THEN the request succeeds",
                parties);
        });
    });
}
