export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Delegation directions in the unit hierarchy
//
// A delegation can run between main units, subunits and people in nine combinations, and
// each one should put the delegating party on the receiving party's list with the access
// it delegated. Two of the nine do not, which is #2952.
//
// The delegations are pre seeded at22 state, not something this suite creates. Nothing in
// this repo or in the Bruno collection it was ported from performs them: only the parties
// are recorded, in the enduser suite's fixture. What was delegated is recorded nowhere.
//
// That is why the checks below assert the shape of the answer, that the delegating party
// is present and that access inherits to subunits, rather than naming the packages. The
// README carries a table of what each direction actually holds, read out of at22 rather
// than out of any specification. Those values are not asserted: this suite does not own
// them and several look incidental.
//
// Creating the delegations here instead was considered and deliberately not done. It needs
// a write client this repo does not appear to have, and these parties are shared with the
// enduser suite, which asserts the same delegations. The README says what would have to
// change first.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
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

    group("Delegation directions in the unit hierarchy", function () {

        group("A main unit delegates to another main unit", function () {
            const parties = lookUp(hovedenhetB.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(parties, hovedenhetA.partyuuid, hovedenhetA.org_no);

            AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(parties, hovedenhetA.partyuuid);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, hovedenhetA.partyuuid, underenhetA.partyuuid);

            AuthorizedPartiesDomainChecks.CheckSubunitInheritsMainUnitAccessPackages(parties, hovedenhetA.partyuuid, underenhetA.partyuuid);
        });

        group("A main unit delegates to a person", function () {
            const parties = lookUp(personC.pid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOrganizationWithNumber(parties, hovedenhetA.partyuuid, hovedenhetA.org_no);

            AuthorizedPartiesDomainChecks.CheckPartyHoldsAccessItself(parties, hovedenhetA.partyuuid);

            AuthorizedPartiesDomainChecks.CheckSubunitIsNestedUnderMainUnit(parties, hovedenhetA.partyuuid, underenhetA.partyuuid);

            AuthorizedPartiesDomainChecks.CheckSubunitInheritsMainUnitAccessPackages(parties, hovedenhetA.partyuuid, underenhetA.partyuuid);
        });

        group("A person delegates to a main unit", function () {
            const parties = lookUp(hovedenhetA.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckPartyType(parties, personA.partyuuid, "Person");

            AuthorizedPartiesDomainChecks.CheckPartyHasNoSubunits(parties, personA.partyuuid);
        });

        group("A person delegates to another person", function () {
            const parties = lookUp(personB.pid);

            AuthorizedPartiesDomainChecks.CheckPartyType(parties, personA.partyuuid, "Person");

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccess(parties, personA.partyuuid);
        });

        group("A subunit delegates to a person", function () {
            const parties = lookUp(personA.pid);

            AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(parties, underenhetD.partyuuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, underenhetD.partyuuid);

            AuthorizedPartiesDomainChecks.CheckPartyHasSomeAccess(parties, underenhetD.partyuuid);
        });

        group("A subunit delegates to a main unit", function () {
            const parties = lookUp(hovedenhetB.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckPartyIsNotTopLevel(parties, underenhetC.partyuuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, underenhetC.partyuuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsOnlyHierarchyElement(parties, hovedenhetC.partyuuid);
        });

        // Asserts today's behaviour rather than the correct one, so it turns red when
        // #2952 is fixed. That is the point of it: the correct outcome is that main unit A
        // appears with the access it delegated. The direction was switched off behind a
        // skipScenario flag in the Bruno folder this replaces, asserting nothing at all.
        group("A main unit delegates to a subunit, and goes missing (#2952)", function () {
            const parties = lookUp(hovedenhetC.dagligleder.pid);

            // Absence alone is satisfied by an empty response, which is also what
            // GetAuthorizedParties returns on any non 200, so the group would stay green if
            // the seeded delegation were revoked and stop tracking #2952. Anchoring on a non
            // empty list keeps the absence meaningful.
            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, hovedenhetA.partyuuid);
        });

        // The same known bug, from the other direction. Also switched off in Bruno.
        group("A subunit delegates to a subunit, and goes missing (#2952)", function () {
            const parties = lookUp(hovedenhetC.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, underenhetD.partyuuid);
        });

        // Read on the accounting firm's daily leader, as the Bruno step was, because that
        // is the subject whose response holds a main unit with both instances and subunits.
        // On a hierarchy subject there is nothing to inspect and the rule goes unexercised.
        group("Instance access stays with the party it was delegated to", function () {
            const parties = lookUp(firm.dagligleder.pid);

            AuthorizedPartiesDomainChecks.CheckSomeMainUnitHoldsInstancesAndHasSubunits(parties);

            AuthorizedPartiesDomainChecks.CheckNoSubunitInheritsInstances(parties);
        });
    });
}
