export { setup } from "./common.js";
import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../domain-checks/access-management/authorized-parties.js";
import { getClients } from "./common.js";

// Daglig leder A skal se person A i lista
// Prerequisite: Person A delegerer enkeltrettigheter til hovedenhet B (navngiving må fikses, i praksis er det B)
export default function (data) {
    const dagligleder = data.testdata.authParties_hovedenhetA.dagligleder;
    let [authorizedPartiesClient] = getClients(dagligleder.userid, dagligleder.partyid, dagligleder.partyuuid, dagligleder.pid);

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
}
