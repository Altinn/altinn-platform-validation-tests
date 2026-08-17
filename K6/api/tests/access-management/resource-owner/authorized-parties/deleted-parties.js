export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { check, group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks, IsInsideRetentionWindow } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: A deleted party keeps granting access to its owner for a retention window
//
//   Given one sole proprietorship client deleted inside the retention window and one outside it
//   When a service owner lists the daily leader's parties with inactive parties included
//   Then the owner of the active sole proprietorship is present
//   And the owner of the client deleted inside the window is present
//   And the owner of the client deleted outside the window is absent
//
// The window is derived from the deletion date and the retention years rather than
// hardcoded, so the assertions do not go stale as the calendar moves.

export default function (data) {
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

    // The fixtures only mean anything while they still sit on the side of the window they
    // were chosen for, so that is established before the parties are asserted.
    group("GIVEN one deleted client inside the retention window and one outside it", function () {
        check(null, {
            [`GIVEN ${deletedInside.name} was deleted inside the ${retentionYears} year window`]:
                () => IsInsideRetentionWindow(deletedInside.deletedDate, retentionYears),
            [`AND ${deletedOutside.name} was deleted outside it`]:
                () => !IsInsideRetentionWindow(deletedOutside.deletedDate, retentionYears),
        });
    });

    group("WHEN a service owner lists the daily leader's parties with inactive parties included", function () {
        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
            "THEN the owner of the active sole proprietorship is present",
            parties, activeEnk.innehaver.partyUuid);

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(
            "AND the owner of the client deleted inside the retention window is present",
            parties, deletedInside.innehaver.partyUuid);

        AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(
            "AND the owner of the client deleted outside the retention window is absent",
            parties, deletedOutside.innehaver.partyUuid);
    });
}
