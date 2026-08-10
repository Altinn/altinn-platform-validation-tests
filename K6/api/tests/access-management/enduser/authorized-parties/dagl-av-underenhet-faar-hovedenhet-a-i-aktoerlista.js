export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";
import { group } from "k6";

import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/authorized-parties.js";
import { getClients } from "./common.js";

// Hovedenhet-A ---> Underenhet-C (H2U)
// Hovedenhet A delegerer testressurs til underenhet C, og daglig leder av underenhet C
// skal se hovedenhet A i aktørlista.
const groupLabel = "dagl-av-underenhet-får-hovedenhet-A-i-aktørlista";

// The scenario is skipped in the Bruno suite because of a known bug in the API, and is
// kept skipped here until that bug is fixed.
const skipDueToKnownBug = true;

export default function (data) {
    if (skipDueToKnownBug) {
        console.warn(`${groupLabel} is skipped due to a known bug`);
        return;
    }

    const dagligleder = data.testdata.authParties_hovedenhetC.dagligleder;
    let [authorizedPartiesClient] = getClients(dagligleder.userid, dagligleder.partyid, dagligleder.partyuuid, dagligleder.pid);

    group(groupLabel, function () {
        const hovedenhet = data.testdata.authParties_hovedenhetA;

        const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
            .withAnyOfResourceIds(["acn-migratedcorrespondence-3008-5555"])
            .withPartyFilter([hovedenhet.partyuuid])
            .build();

        const authorizedParties = GetAuthorizedParties(authorizedPartiesClient, queryParams);

        if (authorizedParties === null) {
            return;
        }

        const parties = authorizedParties.data ?? [];

        // The two filters narrow the response down to hovedenhet A alone, holding only the
        // resource that was filtered on and carrying no subunits.
        AuthorizedPartiesDomainChecks.CheckOnlyExpectedPartiesArePresent(parties, [hovedenhet.partyuuid]);
        AuthorizedPartiesDomainChecks.CheckPartyHasNoSubParties(parties, hovedenhet.partyuuid);

        AuthorizedPartiesDomainChecks.CheckPartyHasResources(parties, hovedenhet.partyuuid, [
            "acn-migratedcorrespondence-3008-5555",
        ]);
        AuthorizedPartiesDomainChecks.CheckPartyHasAccessPackages(parties, hovedenhet.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasRoles(parties, hovedenhet.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasInstances(parties, hovedenhet.partyuuid, []);
    });
}
