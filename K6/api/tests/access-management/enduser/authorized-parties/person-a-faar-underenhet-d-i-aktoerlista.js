export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";
import { group } from "k6";

import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/authorized-parties.js";
import { getClients } from "./common.js";

// Underenhet-D ---> Person-A (U2P)
// Underenhet D delegerer testressurs og instans av app til person A, og person A skal se
// underenhet D i aktørlista.
const groupLabel = "Person-A-får-underenhet-D-i-aktørlista";

export default function (data) {
    const personA = data.testdata.authParties_personA;
    let [authorizedPartiesClient] = getClients(personA.userid, personA.partyid, personA.partyuuid, personA.pid);

    group(groupLabel, function () {
        const hovedenhet = data.testdata.authParties_hovedenhetD;
        const underenhet = hovedenhet.authParties_underenhetD;

        const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
            .withPartyFilter([underenhet.partyuuid])
            .includeInstances(true)
            .build();

        const authorizedParties = GetAuthorizedParties(authorizedPartiesClient, queryParams);

        if (authorizedParties === null) {
            return;
        }

        const parties = authorizedParties.data ?? [];

        // Filtering on the underenhet still returns its hovedenhet, which carries the
        // hierarchy without holding any access itself.
        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, hovedenhet.partyuuid);
        AuthorizedPartiesDomainChecks.CheckPartyHasNoAccess(parties, hovedenhet.partyuuid);
        AuthorizedPartiesDomainChecks.CheckSubPartyIsPresent(parties, hovedenhet.partyuuid, underenhet.partyuuid);

        AuthorizedPartiesDomainChecks.CheckPartyHasInstances(parties, underenhet.partyuuid, [
            {
                resourceId: "app_ttd_ttd-bruno-tilgangspakke-app",
                instanceRef: data.testdata.instancer.underenhetD_instansid,
            },
        ]);
        AuthorizedPartiesDomainChecks.CheckPartyHasAccessPackages(parties, underenhet.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasResources(parties, underenhet.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasRoles(parties, underenhet.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(parties);
    });
}
