export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// A service owner lists the authorized parties of an accounting firm's daily leader.
// The response is a bare array of parties, each carrying the full set of party fields.
// The firm itself appears as a key role party with its subunit, the client organisations
// appear with the packages held through the accountant role, the owner of a sole
// proprietorship client appears as a person party, and no party appears twice.

// The packages an accountant holds on its clients. Hardcoded rather than kept in
// the fixture, matching how the enduser suite keeps delegated access in the tests.
const ACCOUNTANT_PACKAGES = [
    "regnskapsforer-lonn",
    "regnskapsforer-med-signeringsrettighet",
    "regnskapsforer-uten-signeringsrettighet",
];

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("A service owner lists the authorized parties of an accounting firm's daily leader", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const client = firm.client_USENSUELL_UVIRKSOM_TIGER;
        const innehaver = firm.client_ENK_HUMAN_TOPP_KATT_BIL.innehaver;

        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles()
            .includeAccessPackages()
            .includeResources()
            .includeInstances()
            .build();

        // Every outcome below is observed on one lookup, so the request is made once rather
        // than repeated per assertion the way the Bruno steps did.
        group("An accounting firm's daily leader reaches the firm, its clients and their owners", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);

            AuthorizedPartiesDomainChecks.CheckEveryPartyMatchesContract(parties);

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(parties, firm.partyUuid, firm.orgno);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, firm.partyUuid, firm.subunit.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(parties, client.partyUuid, client.orgno);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, client.partyUuid, ACCOUNTANT_PACKAGES);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesRole(parties, client.partyUuid, "regnskapsforer");

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, client.partyUuid, client.subunit.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, client.subunit.partyUuid, ACCOUNTANT_PACKAGES);

            AuthorizedPartiesDomainChecks.CheckPartyType(parties, innehaver.partyUuid, "Person");

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, innehaver.partyUuid, ACCOUNTANT_PACKAGES);

            AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(parties);
        });
    });
}
