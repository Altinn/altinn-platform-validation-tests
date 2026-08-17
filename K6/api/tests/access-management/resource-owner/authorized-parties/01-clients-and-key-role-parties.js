export { handleSummary } from "../../../../../common-imports.js";
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

    // Every step below reads the same subject with the same flags, so the lookup is
    // done once and asserted five ways rather than repeated per step. The request
    // lives in step 01 so the building block's status checks are attributed to it.
    let parties = [];

    // WHEN a service owner lists the authorized parties for the daily leader of the
    // accounting firm with every access information flag on, THEN the response is a
    // bare array of parties and every party carries the full set of party fields.
    group("01 WHEN the service owner lists parties for the daily leader", function () {
        parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);
        AuthorizedPartiesDomainChecks.CheckEveryPartyMatchesContract(parties);
    });

    // THEN the accounting firm the daily leader is a key role in appears in the list,
    // with its own subunit nested under it.
    group("02 THEN the accounting firm appears as a key role party", function () {
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, firm.partyUuid, `the accounting firm ${firm.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(parties, firm.partyUuid, firm.orgno);
        AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, firm.partyUuid, firm.subunit.partyUuid, `the firm subunit ${firm.subunit.name}`);
    });

    // AND a client organisation of the accounting firm appears with the packages the
    // firm holds through the accountant role, and its subunit inherits the same access.
    group("03 AND client organisations appear with client packages", function () {
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, client.partyUuid, `the client ${client.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(parties, client.partyUuid, client.orgno);
        AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, client.partyUuid, ACCOUNTANT_PACKAGES);
        AuthorizedPartiesDomainChecks.CheckPartyIncludesRole(parties, client.partyUuid, "regnskapsforer");
        AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, client.partyUuid, client.subunit.partyUuid, `the client subunit ${client.subunit.name}`);
        AuthorizedPartiesDomainChecks.CheckSubunitIncludesAccessPackages(parties, client.subunit.partyUuid, ACCOUNTANT_PACKAGES);
    });

    // AND the owner of an active sole proprietorship client appears as a person party,
    // holding the client through the accountant role.
    group("04 AND the sole proprietorship owner appears as a person", function () {
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, innehaver.partyUuid, `the sole proprietorship owner ${innehaver.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyType(parties, innehaver.partyUuid, "Person");
        AuthorizedPartiesDomainChecks.CheckPartyIncludesAccessPackages(parties, innehaver.partyUuid, ACCOUNTANT_PACKAGES);
    });

    // AND no party appears twice anywhere in the response, counting main units and
    // their subunits together.
    group("05 AND no party appears twice", function () {
        AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(parties);
    });
}
