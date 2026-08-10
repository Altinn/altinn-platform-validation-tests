export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";
import { group } from "k6";

import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/enduser/authorized-parties.js";
import { getClients } from "./common.js";

// Person-A ---> Hovedenhet-A (P2H)
// Person A delegerer tilgangspakke og ressurs til hovedenhet A, og daglig leder av
// hovedenhet A skal se person A i aktørlista.
const groupLabel = "dagl-A-får-person-A-i-aktørlista";

export default function (data) {
    const dagligleder = data.testdata.authParties_hovedenhetA.dagligleder;
    let [authorizedPartiesClient] = getClients(dagligleder.userid, dagligleder.partyid, dagligleder.partyuuid, dagligleder.pid);

    group(groupLabel, function () {
        const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
            .includeResources(true)
            .build();

        const authorizedParties = GetAuthorizedParties(authorizedPartiesClient, queryParams);

        if (authorizedParties === null) {
            return;
        }

        const parties = authorizedParties.data ?? [];

        // Person A is expected in the response holding only the delegated resources,
        // since that is the only thing the filter asks for.
        const personA = data.testdata.authParties_personA;

        AuthorizedPartiesDomainChecks.CheckPartyHasResources(parties, personA.partyuuid, [
            "devtest_gar_bruno_accesslist",
            "devtest_gar_bruno_accesslist_actionfilter",
        ]);
        AuthorizedPartiesDomainChecks.CheckPartyHasAccessPackages(parties, personA.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasRoles(parties, personA.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasInstances(parties, personA.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(parties);
    });
}
