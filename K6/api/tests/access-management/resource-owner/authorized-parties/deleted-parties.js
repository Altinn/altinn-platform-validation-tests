export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { check, group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks, IsInsideRetentionWindow } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Feature: A deleted party keeps granting access to its owner for a retention window
//
//   Given one sole proprietorship client deleted inside the retention window and one outside it
//   When a service owner lists the daily leader's parties with inactive parties included
//   Then the owner of the active sole proprietorship is present
//   And the owner of the client deleted inside the window is present
//   And the owner of the client deleted outside the window is absent
//
// The window is derived from the deletion date and the retention years rather than
// hardcoded, so the assertions do not go stale as the calendar moves.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Feature: A deleted party keeps granting access to its owner for a retention window", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const retentionYears = data.testdata.deletedPartyRetentionYears;
        const activeEnk = firm.client_ENK_HUMAN_TOPP_KATT_BIL;
        const deletedInside = firm.client_ENK_DELETED_2025_11_27_InnehaverAccess;
        const deletedOutside = firm.client_ENK_DELETED_2023_11_01_NoInnehaverAccess;

        const request = new AuthorizedPartiesRequestBuilder().withPerson(firm.dagligleder.pid).build();
        const queryParams = new AuthorizedPartiesQueryBuilder()
            .includeRoles()
            .includeAccessPackages()
            .includeInactiveParties("true")
            .build();

        scenario({
            name: "A deleted party keeps granting access to its owner for a retention window",
            when: "a service owner lists the daily leader's parties with inactive parties included",
        }, function () {
            // Preconditions, so they read as the scenario's GIVEN. The fixtures only mean
            // anything while they still sit on the side of the window they were chosen for.
            check(null, {
                [`GIVEN ${deletedInside.name} was deleted inside the ${retentionYears} year window`]:
                    () => IsInsideRetentionWindow(deletedInside.deletedDate, retentionYears),
                [`GIVEN ${deletedOutside.name} was deleted outside it`]:
                    () => !IsInsideRetentionWindow(deletedOutside.deletedDate, retentionYears),
            });

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                parties, activeEnk.innehaver.partyUuid,
                "THEN the owner of the active sole proprietorship is present");

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
                parties, deletedInside.innehaver.partyUuid,
                "AND the owner of the client deleted inside the retention window is present");

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
                parties, deletedOutside.innehaver.partyUuid,
                "AND the owner of the client deleted outside the retention window is absent");
        });
    });
}
