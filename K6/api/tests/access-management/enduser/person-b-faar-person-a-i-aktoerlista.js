export { handleSummary } from "../../../../common-imports.js";
export { setup } from "./common.js";
import { group } from "k6";

import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../domain-checks/access-management/authorized-parties.js";
import { getClients } from "./common.js";

// Person-A ---> Person-B (P2P)
// Person A delegerer tilgangspakke til person B, og person B skal se person A i
// aktørlista.
const groupLabel = "Person-B-får-person-A-i-aktørlista";

export default function (data) {
    const personB = data.testdata.authParties_personB;
    let [authorizedPartiesClient] = getClients(personB.userid, personB.partyid, personB.partyuuid, personB.pid);

    group(groupLabel, function () {
        const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
            .includeRoles(false)
            .includeAccessPackages(true)
            .build();

        const authorizedParties = GetAuthorizedParties(authorizedPartiesClient, queryParams);

        if (authorizedParties === null) {
            return;
        }

        const parties = authorizedParties.data ?? [];

        // Person A is expected in the response holding only the delegated access packages,
        // since that is the only thing the filter asks for.
        const personA = data.testdata.authParties_personA;

        AuthorizedPartiesDomainChecks.CheckPartyHasAccessPackages(parties, personA.partyuuid, [
            "innbygger-barn-foreldre",
            "innbygger-helsetjenester",
            "innbygger-pleie-omsorg",
            "innbygger-samliv",
        ]);
        AuthorizedPartiesDomainChecks.CheckPartyHasResources(parties, personA.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasRoles(parties, personA.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasInstances(parties, personA.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(parties);
    });
}
