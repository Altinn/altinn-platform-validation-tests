export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: Every delegation direction in the unit hierarchy resolves the same way
//
//   When a main unit delegates to a main unit, a person, or a subunit
//   When a person delegates to a main unit, a person, or a subunit
//   When a subunit delegates to a main unit or to a subunit
//   Then access packages and resources extend from a main unit to its subunits,
//     but instance access never does
//
// Two directions assert today's behaviour rather than the correct one: when the
// receiver of a delegation is a subunit, the delegating party goes missing from the
// receiving side entirely. That is issue #2952, and those two steps turn red when it
// is fixed, which is the point of them. They were switched off with a skipScenario
// flag in the Bruno folder this replaces, so they registered no assertions at all.
//
// The hierarchy fixtures live with the enduser suite, which was ported from the same
// Bruno fixture this scenario reads, so they are reused rather than duplicated.

export default function (data) {
    const [authorizedPartiesClient] = getClients();

    const hovedenhetA = data.hierarchy.authParties_hovedenhetA;
    const hovedenhetB = data.hierarchy.authParties_hovedenhetB;
    const hovedenhetC = data.hierarchy.authParties_hovedenhetC;
    const hovedenhetD = data.hierarchy.authParties_hovedenhetD;
    const underenhetA = hovedenhetA.authParties_underenhetA;
    const underenhetC = hovedenhetC.authParties_underenhetC;
    const underenhetD = hovedenhetD.authParties_underenhetD;
    const personA = data.hierarchy.authParties_personA;
    const personB = data.hierarchy.authParties_personB;
    const personC = hovedenhetA.authParties_personC;

    const queryParams = new AuthorizedPartiesQueryBuilder()
        .includeRoles()
        .includeAccessPackages()
        .includeResources()
        .includeInstances()
        .build();

    const lookup = (pid) => GetAuthorizedParties(
        authorizedPartiesClient,
        new AuthorizedPartiesRequestBuilder().withPerson(pid).build(),
        queryParams,
    );

    group("WHEN main unit A has delegated to main unit B, looking up B's daily leader", function () {
        const parties = lookup(hovedenhetB.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(
            "THEN the delegating main unit is in the receiving side's list",
            parties, hovedenhetA.partyuuid, hovedenhetA.org_no);

        AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(
            "AND it holds the delegated access itself",
            parties, hovedenhetA.partyuuid);

        AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
            "AND the delegating unit's subunit is nested under it",
            parties, hovedenhetA.partyuuid, underenhetA.partyuuid);

        AuthorizedPartiesDomainChecks.CheckSubunitInheritsMainUnitAccessPackages(
            "AND the received access extends to that subunit",
            parties, hovedenhetA.partyuuid, underenhetA.partyuuid);
    });

    group("WHEN main unit A has delegated to a person, looking up that person", function () {
        const parties = lookup(personC.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(
            "THEN the delegating main unit is in the person's list",
            parties, hovedenhetA.partyuuid, hovedenhetA.org_no);

        AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(
            "AND it holds the delegated access itself",
            parties, hovedenhetA.partyuuid);

        AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
            "AND the delegating unit's subunit is nested under it",
            parties, hovedenhetA.partyuuid, underenhetA.partyuuid);

        AuthorizedPartiesDomainChecks.CheckSubunitInheritsMainUnitAccessPackages(
            "AND the received access extends to that subunit",
            parties, hovedenhetA.partyuuid, underenhetA.partyuuid);
    });

    group("WHEN a person has delegated to main unit A, looking up A's daily leader", function () {
        const parties = lookup(hovedenhetA.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckPartyType(
            "THEN the delegating person is in the receiving unit's list as a person party",
            parties, personA.partyuuid, "Person");

        AuthorizedPartiesDomainChecks.CheckPartyHasNoSubunits(
            "AND the person party has no subunits",
            parties, personA.partyuuid);
    });

    group("WHEN one person has delegated to another, looking up the receiving person", function () {
        const parties = lookup(personB.pid);

        AuthorizedPartiesDomainChecks.CheckPartyType(
            "THEN the delegating person is in the receiving person's list as a person party",
            parties, personA.partyuuid, "Person");

        AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccess(
            "AND the delegating person carries the access that was delegated",
            parties, personA.partyuuid);
    });

    group("WHEN a subunit has delegated to a person, looking up that person", function () {
        const parties = lookup(personA.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(
            "THEN the delegating subunit is not at the top level, since a subunit never is",
            parties, underenhetD.partyuuid);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
            "AND it is returned nested under its main unit instead",
            parties, underenhetD.partyuuid);

        AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccess(
            "AND it carries the access it delegated",
            parties, underenhetD.partyuuid);
    });

    group("WHEN a subunit has delegated to main unit B, looking up B's daily leader", function () {
        const parties = lookup(hovedenhetB.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(
            "THEN the delegating subunit is not at the top level, since a subunit never is",
            parties, underenhetC.partyuuid);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
            "AND it is returned nested under its own main unit",
            parties, underenhetC.partyuuid);

        AuthorizedPartiesDomainChecks.CheckPartyIsOnlyHierarchyElement(
            "AND that main unit is only a hierarchy carrier, having delegated nothing itself",
            parties, hovedenhetC.partyuuid);
    });

    group("WHEN main unit A has delegated to a subunit, looking up the receiving side", function () {
        const parties = lookup(hovedenhetC.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
            "THEN the delegating main unit is still missing from the receiving side (#2952), which is wrong but current. If it has started appearing, flip this step to expect it",
            parties, hovedenhetA.partyuuid);
    });

    group("WHEN a subunit has delegated to another subunit, looking up the receiving side", function () {
        const parties = lookup(hovedenhetC.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
            "THEN the delegating subunit is still missing from the receiving side (#2952), which is wrong but current. If it has started appearing, flip this step to expect it",
            parties, underenhetD.partyuuid);
    });

    group("WHEN the same lookup is read for instance access across every direction", function () {
        const parties = lookup(hovedenhetB.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckNoSubunitInheritsInstances(
            "THEN no subunit carries an instance its main unit holds, because an instance is delegated to one party and stays there",
            parties);
    });
}
