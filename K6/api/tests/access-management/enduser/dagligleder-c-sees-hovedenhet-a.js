export { setup } from "./common.js";
import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../domain-checks/access-management/authorized-parties.js";
import { getClients } from "./common.js";

// Daglig leder C skal se hovedenhet A i lista
// Prerequisite: Hovedenhet A delegerer enkeltrettighet til underenhet C

// The scenario is skipped in the Bruno suite because of a known bug in the API, and is
// kept skipped here until that bug is fixed.
const skipDueToKnownBug = true;

export default function (data) {
    if (skipDueToKnownBug) {
        console.warn("dagligleder-c-sees-hovedenhet-a is skipped due to a known bug");
        return;
    }

    const dagligleder = data.testdata.authParties_hovedenhetC.dagligleder;
    let [authorizedPartiesClient] = getClients(dagligleder.userid, dagligleder.partyid, dagligleder.partyuuid, dagligleder.pid);

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
}
