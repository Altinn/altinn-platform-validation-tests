export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";
import { group } from "k6";

import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/enduser/authorized-parties.js";
import { getClients } from "./common.js";

// Hovedenhet-A ---> Person-C (H2P)
// Hovedenhet A delegerer app-instans til person C, og person C skal se hovedenhet A i
// aktørlista.
const groupLabel = "Person-C-får-hovedenhet-A-i-aktørlista";

export default function (data) {
    const personC = data.testdata.authParties_hovedenhetA.authParties_personC;
    let [authorizedPartiesClient] = getClients(personC.userid, personC.partyid, personC.partyuuid, personC.pid);

    group(groupLabel, function () {
        const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
            .includeInstances(true)
            .build();

        const authorizedParties = GetAuthorizedParties(authorizedPartiesClient, queryParams);

        if (authorizedParties === null) {
            return;
        }

        const parties = authorizedParties.data ?? [];

        // Hovedenhet A holds the delegated instance and nothing else, since that is the only
        // thing the filter asks for. Its underenhet comes along without any access.
        const hovedenhet = data.testdata.authParties_hovedenhetA;
        const underenhet = hovedenhet.authParties_underenhetA;

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, hovedenhet.partyuuid);
        AuthorizedPartiesDomainChecks.CheckSubPartyIsPresent(parties, hovedenhet.partyuuid, underenhet.partyuuid);

        AuthorizedPartiesDomainChecks.CheckPartyHasInstances(parties, hovedenhet.partyuuid, [
            {
                resourceId: "app_ttd_ttd-bruno-tilgangspakke-app",
                instanceRef: data.testdata.instancer.personC_instansid,
            },
        ]);
        AuthorizedPartiesDomainChecks.CheckPartyHasAccessPackages(parties, hovedenhet.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasResources(parties, hovedenhet.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasRoles(parties, hovedenhet.partyuuid, []);

        AuthorizedPartiesDomainChecks.CheckPartyHasNoAccess(parties, underenhet.partyuuid);
        AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(parties);
    });
}
