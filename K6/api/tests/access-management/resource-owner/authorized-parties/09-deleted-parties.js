export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { check, group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks, IsInsideRetentionWindow } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: A deleted party keeps granting access to its owner for a retention window
//
//   When a service owner lists the daily leader's parties with inactive parties included
//   Then the owner of the active sole proprietorship is present
//   And the owner of the client deleted inside the retention window is present
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

    // WHEN a service owner lists the daily leader's authorized parties, the owners of
    // the deleted sole proprietorship clients are included or excluded by the retention
    // window.
    group("01 WHEN the service owner lists parties with deleted clients", function () {
        const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        // The fixtures only mean anything if they still sit on the side of the window
        // they were chosen for, so that is asserted before the parties are.
        check(null, {
            "The fixture deleted inside the window is still inside it":
                () => IsInsideRetentionWindow(deletedInside.deletedDate, retentionYears),
            "The fixture deleted outside the window is still outside it":
                () => !IsInsideRetentionWindow(deletedOutside.deletedDate, retentionYears),
        });

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, activeEnk.innehaver.partyUuid, `the active sole proprietorship owner ${activeEnk.innehaver.name}`);
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, deletedInside.innehaver.partyUuid, `${deletedInside.innehaver.name}, owner of the recently deleted sole proprietorship`);
        AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, deletedOutside.innehaver.partyUuid, `${deletedOutside.name} was deleted outside the ${retentionYears} year retention window`);
    });
}
