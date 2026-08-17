export { handleSummary } from "../../../../../common-imports.js";
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
//   When a subunit delegates to a main unit, a subunit, or receives from one
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

    // WHEN main unit A has delegated to main unit B, a lookup of B's daily leader returns
    // main unit A with the delegated access, and the access B received extends to A's
    // subunit.
    group("01 WHEN a main unit delegates to a main unit", function () {
        const parties = lookup(hovedenhetB.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, hovedenhetA.partyuuid, hovedenhetA.name);
        AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(parties, hovedenhetA.partyuuid, hovedenhetA.org_no);
        AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(parties, hovedenhetA.partyuuid);
        AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, hovedenhetA.partyuuid, underenhetA.partyuuid, underenhetA.name);
        AuthorizedPartiesDomainChecks.CheckSubunitInheritsMainUnitAccessPackages(parties, hovedenhetA.partyuuid, underenhetA.partyuuid);
    });

    // WHEN main unit A has delegated to a person, a lookup of that person returns main
    // unit A with the delegated access, and the access the person received extends to A's
    // subunit.
    group("02 WHEN a main unit delegates to a person", function () {
        const parties = lookup(personC.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, hovedenhetA.partyuuid, hovedenhetA.name);
        AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(parties, hovedenhetA.partyuuid, hovedenhetA.org_no);
        AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(parties, hovedenhetA.partyuuid);
        AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, hovedenhetA.partyuuid, underenhetA.partyuuid, underenhetA.name);
        AuthorizedPartiesDomainChecks.CheckSubunitInheritsMainUnitAccessPackages(parties, hovedenhetA.partyuuid, underenhetA.partyuuid);
    });

    // WHEN a person has delegated to main unit A, a lookup of A's daily leader returns
    // that person as a party. A person party has no subunits.
    group("03 WHEN a person delegates to a main unit", function () {
        const parties = lookup(hovedenhetA.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, personA.partyuuid, `the person ${personA.lastname}`);
        AuthorizedPartiesDomainChecks.CheckPartyType(parties, personA.partyuuid, "Person");
        AuthorizedPartiesDomainChecks.CheckPartyHasNoSubunits(parties, personA.partyuuid, "a person has no subunits");
    });

    // WHEN one person has delegated to another, a lookup of the receiving person returns
    // the delegating person with the access that was delegated.
    group("04 WHEN a person delegates to a person", function () {
        const parties = lookup(personB.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, personA.partyuuid, `the person ${personA.lastname}`);
        AuthorizedPartiesDomainChecks.CheckPartyType(parties, personA.partyuuid, "Person");
        AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccess(parties, personA.partyuuid, `the person ${personA.lastname}`);
    });

    // WHEN a person has received access from a subunit, a lookup of that person returns
    // the subunit nested under its main unit, since a subunit is never returned at the top
    // level.
    group("05 WHEN a person delegates to a subunit", function () {
        const parties = lookup(personA.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(parties, underenhetD.partyuuid);
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, underenhetD.partyuuid, `the subunit ${underenhetD.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccess(parties, underenhetD.partyuuid, `the subunit ${underenhetD.name}`);
    });

    // WHEN a subunit has delegated to main unit B, a lookup of B's daily leader returns
    // the delegating subunit nested under its own main unit. The delegating subunit's main
    // unit is only a hierarchy carrier, it holds no access of its own from this delegation.
    group("06 WHEN a subunit delegates to a main unit", function () {
        const parties = lookup(hovedenhetB.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(parties, underenhetC.partyuuid);
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, underenhetC.partyuuid, `the subunit ${underenhetC.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyIsOnlyHierarchyElement(parties, hovedenhetC.partyuuid);
    });

    // WHEN main unit A has delegated to a subunit, the delegating main unit does not show
    // up on the receiving side at all. The correct behaviour is that main unit A appears
    // with the access it delegated.
    //
    // This asserts today's behaviour, not the correct one, and turns red when #2952 lands.
    group("07 WHEN a main unit delegates to a subunit", function () {
        const parties = lookup(hovedenhetC.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
            parties,
            hovedenhetA.partyuuid,
            `#2952 is still open, so ${hovedenhetA.name} is expected to be missing. If it has started appearing, flip this step to expect it`,
        );
    });

    // WHEN a subunit has delegated to another subunit, the delegating subunit does not
    // show up on the receiving side at all. The correct behaviour is that it appears
    // nested under its own main unit with the access it delegated.
    //
    // This asserts today's behaviour, not the correct one, and turns red when #2952 lands.
    group("08 WHEN a subunit delegates to a subunit", function () {
        const parties = lookup(hovedenhetC.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
            parties,
            underenhetD.partyuuid,
            `#2952 is still open, so ${underenhetD.name} is expected to be missing. If it has started appearing, flip this step to expect it`,
        );
    });

    // THEN across every direction the same rule holds: access packages and resources a
    // main unit holds extend to its subunits, but instance access does not. An instance is
    // delegated to one party and stays there.
    group("09 THEN instance access is not inherited by subunits", function () {
        const parties = lookup(hovedenhetB.dagligleder.pid);

        AuthorizedPartiesDomainChecks.CheckNoSubunitInheritsInstances(parties);
    });
}
