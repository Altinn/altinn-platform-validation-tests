export { setup } from "./common.js";
import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../domain-checks/access-management/authorized-parties.js";
import { getClients } from "./common.js";

export default function (data) {
    const dagligleder = data.testdata.authParties_hovedenhetB.dagligleder;
    let [authorizedPartiesClient] = getClients(dagligleder.userid, dagligleder.partyid, dagligleder.partyuuid, dagligleder.pid);

    const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
        .includePartiesViaKeyRoles(true)
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
}
