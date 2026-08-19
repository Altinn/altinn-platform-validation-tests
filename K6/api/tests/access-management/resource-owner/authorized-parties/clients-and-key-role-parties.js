export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Feature: A service owner lists the authorized parties of an accounting firm's daily leader
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

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Feature: A service owner lists the authorized parties of an accounting firm's daily leader", function () {
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
        scenario({
            name: "An accounting firm's daily leader reaches the firm, its clients and their owners",
            given: [
                "an accounting firm whose daily leader holds a key role in it",
                "the firm is the accountant for several client organisations",
            ],
            when: "a service owner lists the authorized parties of the firm's daily leader, with every access information flag on",
        }, function () {
            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(
                parties,
                "THEN the response is a bare array of parties");

            AuthorizedPartiesDomainChecks.CheckEveryPartyMatchesContract(
                parties,
                "AND every party carries the party fields of the contract");

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(
                parties, firm.partyUuid, firm.orgno,
                "AND the accounting firm appears as an organisation");

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
                parties, firm.partyUuid, firm.subunit.partyUuid,
                "AND the accounting firm's subunit is nested under it");

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(
                parties, client.partyUuid, client.orgno,
                "AND a client organisation of the firm appears as an organisation");

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                parties, client.partyUuid, ACCOUNTANT_PACKAGES,
                "AND the client organisation carries the accountant packages");

            AuthorizedPartiesDomainChecks.CheckPartyIncludesRole(
                parties, client.partyUuid, "regnskapsforer",
                "AND the client organisation is held through the accountant role");

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
                parties, client.partyUuid, client.subunit.partyUuid,
                "AND the client organisation's subunit is nested under it");

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                parties, client.subunit.partyUuid, ACCOUNTANT_PACKAGES,
                "AND the client organisation's subunit carries the same accountant packages");

            AuthorizedPartiesDomainChecks.CheckPartyType(
                parties, innehaver.partyUuid, "Person",
                "AND the owner of a sole proprietorship client appears as a person party");

            AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(
                parties, innehaver.partyUuid, ACCOUNTANT_PACKAGES,
                "AND the sole proprietorship owner carries the accountant packages");

            AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(
                parties,
                "AND no party appears twice anywhere in the response");
        });
    });
}
