export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";
import { group } from "k6";

import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/enduser/authorized-parties.js";
import { getClients } from "./common.js";

// Hovedenhet-A ---> Hovedenhet-B (H2H)
// Hovedenhet A delegerer tilgangspakke og testressurs til hovedenhet B, og daglig leder
// av hovedenhet B skal se hovedenhet A i aktørlista.
const groupLabel = "dagl-B-får-hovedenhet-A-i-aktørlista";

/**
 * @param {ReturnType<typeof import("./common.js").setup>} data Test data from setup.
 */
export default function (data) {
    const dagligleder = data.testdata.authParties_hovedenhetB.dagligleder;
    let [authorizedPartiesClient] = getClients(dagligleder.userid, dagligleder.partyid, dagligleder.partyuuid, dagligleder.pid);

    group(groupLabel, function () {
        const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
            .includePartiesViaKeyRoles("true")
            .build();

        const authorizedParties = GetAuthorizedParties(authorizedPartiesClient, queryParams);

        if (authorizedParties === null) {
            return;
        }

        const parties = authorizedParties.data ?? [];

        // The hovedenhet reached through the key role, and its underenhet, are both expected
        // in the response, neither of them holding any access.
        const hovedenhet = data.testdata.authParties_hovedenhetA;
        const underenhet = hovedenhet.authParties_underenhetA;

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, hovedenhet.partyuuid);
        AuthorizedPartiesDomainChecks.CheckSubPartyIsPresent(parties, hovedenhet.partyuuid, underenhet.partyuuid);
        AuthorizedPartiesDomainChecks.CheckPartyHasNoAccess(parties, hovedenhet.partyuuid);
        AuthorizedPartiesDomainChecks.CheckPartyHasNoAccess(parties, underenhet.partyuuid);
        AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(parties);
    });
}
