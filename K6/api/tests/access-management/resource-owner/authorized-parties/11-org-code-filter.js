export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getAdminClient, getClients, OTHER_SERVICE_OWNER_ORG_CODE } from "./common.js";

// Scenario: Which org code a caller may ask on behalf of depends on its scope
//
//   When a service owner filters on its own org code, the request succeeds
//   When it filters on another service owner's org code, the request is refused
//   And the admin scope is allowed that same org code
//
// This filter only exists on the service owner surface, since a plain resource
// owner is limited to the org code it owns.

export default function (data) {
    const [authorizedPartiesClient] = getClients();

    const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
    const ownOrgCode = data.sharedTestData.serviceOwners.digdir.org;
    const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();

    // WHEN a service owner filters on its own org code, the request succeeds and the list
    // is narrowed to parties where the subject has access to a resource owned by that
    // service owner.
    group("01 WHEN filtering on the caller's own org code", function () {
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeAccessPackages()
            .withOrgCode(ownOrgCode)
            .build();

        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckResponseIsPartyArray(parties);
    });

    // WHEN a service owner with only the resource owner scope filters on an org code
    // belonging to another service owner, the request is rejected. The caller may only ask
    // on behalf of the org code it owns.
    group("02 WHEN filtering on another service owner's org code", function () {
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeAccessPackages()
            .withOrgCode(OTHER_SERVICE_OWNER_ORG_CODE)
            .build();

        // The building block asserts 200, so this refusal goes straight to the client.
        const response = authorizedPartiesClient.GetAuthorizedParties(request, queryParams);

        AuthorizedPartiesDomainChecks.CheckBadRequest(
            response,
            `a resource owner filtering on the org code '${OTHER_SERVICE_OWNER_ORG_CODE}' it does not own`,
            OTHER_SERVICE_OWNER_ORG_CODE,
        );
    });

    // AND the same filter that was refused for the resource owner scope is allowed with
    // the admin scope, which may ask on behalf of any org code.
    group("03 AND the admin scope may filter on any org code", function () {
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeAccessPackages()
            .withOrgCode(OTHER_SERVICE_OWNER_ORG_CODE)
            .build();

        const parties = GetAuthorizedParties(getAdminClient(), request, queryParams);

        AuthorizedPartiesDomainChecks.CheckResponseIsPartyArray(parties);
    });
}
