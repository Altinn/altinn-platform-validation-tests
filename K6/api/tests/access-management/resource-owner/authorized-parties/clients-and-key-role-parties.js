export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: A service owner lists the authorized parties of an accounting firm's daily leader
//
//   When a service owner lists the authorized parties for the daily leader of the accounting firm
//   Then the response is a bare array of parties, each carrying the full set of party fields
//   And the accounting firm itself appears as a key role party with its subunit
//   And the client organisations appear with the packages held through the accountant role
//   And the owner of a sole proprietorship client appears as a person party
//   And no party appears twice anywhere in the response

// The packages an accountant holds on its clients. Hardcoded rather than kept in
// the fixture, matching how the enduser suite keeps delegated access in the tests.
const ACCOUNTANT_PACKAGES = [
    "regnskapsforer-lonn",
    "regnskapsforer-med-signeringsrettighet",
    "regnskapsforer-uten-signeringsrettighet",
];

export default function (data) {
    group("Scenario: A service owner lists the authorized parties of an accounting firm's daily leader", function () {
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
        group("WHEN a service owner lists the authorized parties for the accounting firm's daily leader", function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(
                "THEN the response is a bare array of parties",
                parties);

            AuthorizedPartiesDomainChecks.CheckEveryPartyMatchesContract(
                "AND every party carries the party fields of the contract",
                parties);

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(
                "AND the accounting firm the daily leader holds a key role in appears as an organisation",
                parties, firm.partyUuid, firm.orgno);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
                "AND the accounting firm's subunit is nested under it",
                parties, firm.partyUuid, firm.subunit.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(
                "AND a client organisation of the firm appears as an organisation",
                parties, client.partyUuid, client.orgno);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                "AND the client organisation carries the accountant packages",
                parties, client.partyUuid, ACCOUNTANT_PACKAGES);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesRole(
                "AND the client organisation is held through the accountant role",
                parties, client.partyUuid, "regnskapsforer");

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
                "AND the client organisation's subunit is nested under it",
                parties, client.partyUuid, client.subunit.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                "AND the client organisation's subunit carries the same accountant packages",
                parties, client.subunit.partyUuid, ACCOUNTANT_PACKAGES);

            AuthorizedPartiesDomainChecks.CheckPartyType(
                "AND the owner of a sole proprietorship client appears as a person party",
                parties, innehaver.partyUuid, "Person");

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                "AND the sole proprietorship owner carries the accountant packages too",
                parties, innehaver.partyUuid, ACCOUNTANT_PACKAGES);

            AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(
                "AND no party appears twice anywhere in the response",
                parties);
        });
    });
}
