export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Feature: Delegation directions in the unit hierarchy
//
// A delegation can run between main units, subunits and people in nine combinations, and
// each one should put the delegating party on the receiving party's list with the access
// it delegated. Two of the nine do not, which is #2952.
//
// The delegations themselves already exist in the at22 fixtures, so they are the GIVEN of
// each scenario rather than something the test performs. The hierarchy fixtures live with
// the enduser suite, ported from the same Bruno file this reads.

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
    const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;

    const queryParams = new AuthorizedPartiesQueryBuilder()
        .includeRoles()
        .includeAccessPackages()
        .includeResources()
        .includeInstances()
        .build();

    const lookUp = (pid) => GetAuthorizedParties(
        authorizedPartiesClient,
        new AuthorizedPartiesRequestBuilder().withPerson(pid).build(),
        queryParams,
    );

    group("Feature: Delegation directions in the unit hierarchy", function () {

        scenario({
            name: "A main unit delegates to another main unit",
            given: "main unit A has delegated access to main unit B",
            when: "a service owner lists the authorized parties of B's daily leader",
        }, function () {
            const parties = lookUp(hovedenhetB.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(
                "THEN main unit A is in the list",
                parties, hovedenhetA.partyuuid, hovedenhetA.org_no);

            AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(
                "AND it holds the access it delegated",
                parties, hovedenhetA.partyuuid);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
                "AND A's own subunit is nested under it",
                parties, hovedenhetA.partyuuid, underenhetA.partyuuid);

            AuthorizedPartiesDomainChecks.CheckSubunitInheritsMainUnitAccessPackages(
                "AND the delegated access extends to that subunit",
                parties, hovedenhetA.partyuuid, underenhetA.partyuuid);
        });

        scenario({
            name: "A main unit delegates to a person",
            given: "main unit A has delegated access to person C",
            when: "a service owner lists the authorized parties of person C",
        }, function () {
            const parties = lookUp(personC.pid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(
                "THEN main unit A is in the list",
                parties, hovedenhetA.partyuuid, hovedenhetA.org_no);

            AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(
                "AND it holds the access it delegated",
                parties, hovedenhetA.partyuuid);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(
                "AND A's own subunit is nested under it",
                parties, hovedenhetA.partyuuid, underenhetA.partyuuid);

            AuthorizedPartiesDomainChecks.CheckSubunitInheritsMainUnitAccessPackages(
                "AND the delegated access extends to that subunit",
                parties, hovedenhetA.partyuuid, underenhetA.partyuuid);
        });

        scenario({
            name: "A person delegates to a main unit",
            given: "person A has delegated access to main unit A",
            when: "a service owner lists the authorized parties of A's daily leader",
        }, function () {
            const parties = lookUp(hovedenhetA.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckPartyType(
                "THEN person A is in the list as a person party",
                parties, personA.partyuuid, "Person");

            AuthorizedPartiesDomainChecks.CheckPartyHasNoSubunits(
                "AND that party has no subunits, because a person cannot have any",
                parties, personA.partyuuid);
        });

        scenario({
            name: "A person delegates to another person",
            given: "person A has delegated access to person B",
            when: "a service owner lists the authorized parties of person B",
        }, function () {
            const parties = lookUp(personB.pid);

            AuthorizedPartiesDomainChecks.CheckPartyType(
                "THEN person A is in the list as a person party",
                parties, personA.partyuuid, "Person");

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccess(
                "AND person A carries the access that was delegated",
                parties, personA.partyuuid);
        });

        scenario({
            name: "A subunit delegates to a person",
            given: "subunit D has delegated access to person A",
            when: "a service owner lists the authorized parties of person A",
        }, function () {
            const parties = lookUp(personA.pid);

            AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(
                "THEN subunit D is not a top level party",
                parties, underenhetD.partyuuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                "AND it is in the list nested under its own main unit",
                parties, underenhetD.partyuuid);

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccess(
                "AND it carries the access it delegated",
                parties, underenhetD.partyuuid);
        });

        scenario({
            name: "A subunit delegates to a main unit",
            given: "subunit C has delegated access to main unit B",
            when: "a service owner lists the authorized parties of B's daily leader",
        }, function () {
            const parties = lookUp(hovedenhetB.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(
                "THEN subunit C is not a top level party",
                parties, underenhetC.partyuuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                "AND it is in the list nested under main unit C",
                parties, underenhetC.partyuuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOnlyHierarchyElement(
                "AND main unit C carries no access, being only the hierarchy above the subunit",
                parties, hovedenhetC.partyuuid);
        });

        // Asserts today's behaviour rather than the correct one, so it turns red when
        // #2952 is fixed. That is the point of it: the correct outcome is that main unit A
        // appears with the access it delegated. The direction was switched off behind a
        // skipScenario flag in the Bruno folder this replaces, asserting nothing at all.
        scenario({
            name: "A main unit delegates to a subunit, and goes missing (#2952)",
            given: "main unit A has delegated access to subunit C",
            when: "a service owner lists the authorized parties of C's daily leader",
        }, function () {
            const parties = lookUp(hovedenhetC.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
                "THEN main unit A is absent from the list, which is #2952 and not the correct outcome",
                parties, hovedenhetA.partyuuid);
        });

        // The same known bug, from the other direction. Also switched off in Bruno.
        scenario({
            name: "A subunit delegates to a subunit, and goes missing (#2952)",
            given: "subunit D has delegated access to subunit C",
            when: "a service owner lists the authorized parties of C's daily leader",
        }, function () {
            const parties = lookUp(hovedenhetC.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
                "THEN subunit D is absent from the list, which is #2952 and not the correct outcome",
                parties, underenhetD.partyuuid);
        });

        // Read on the accounting firm's daily leader, as the Bruno step was, because that
        // is the subject whose response holds a main unit with both instances and subunits.
        // On a hierarchy subject there is nothing to inspect and the rule goes unexercised.
        scenario({
            name: "Instance access stays with the party it was delegated to",
            when: "a service owner lists the authorized parties of the accounting firm's daily leader",
        }, function () {
            const parties = lookUp(firm.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckSomeMainUnitHoldsInstancesAndHasSubunits(
                "GIVEN a main unit in the list holds instance access and has subunits",
                parties);

            AuthorizedPartiesDomainChecks.CheckNoSubunitInheritsInstances(
                "THEN no subunit carries an instance its main unit holds",
                parties);
        });
    });
}
