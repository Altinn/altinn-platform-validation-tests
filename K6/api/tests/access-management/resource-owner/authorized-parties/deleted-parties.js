export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { check, group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks, IsInsideRetentionWindow } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// A deleted party keeps granting access to its owner for a retention window. Of two sole
// proprietorship clients, one deleted inside the window and one outside it, only the
// owner of the first is still returned alongside the owner of the active client.
//
// The window is derived from the deletion date and the retention years rather than
// hardcoded, so the assertions do not go stale as the calendar moves.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("A deleted party keeps granting access to its owner for a retention window", function () {
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

        group("A deleted party keeps granting access to its owner for a retention window", function () {
            // The fixtures only mean anything while they still sit on the side of the
            // window they were chosen for, so that is asserted before the parties are.
            check(null, {
                [`${deletedInside.name} was deleted inside the ${retentionYears} year window`]:
                    () => IsInsideRetentionWindow(deletedInside.deletedDate, retentionYears),
                [`${deletedOutside.name} was deleted outside the ${retentionYears} year window`]:
                    () => !IsInsideRetentionWindow(deletedOutside.deletedDate, retentionYears),
            });

            const parties = GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, activeEnk.innehaver.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, deletedInside.innehaver.partyUuid);

            AuthorizedPartiesDomainChecks.CheckPartyIsAbsent(parties, deletedOutside.innehaver.partyUuid);
        });
    });
}
