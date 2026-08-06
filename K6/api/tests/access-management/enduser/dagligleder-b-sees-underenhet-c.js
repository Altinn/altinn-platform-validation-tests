export { setup } from "./common.js";
import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../domain-checks/access-management/authorized-parties.js";
import { getClients } from "./common.js";

// Daglig leder B skal se underenhet C i lista
// Prerequisite: Underenhet C delegerer tilgangspakker og enkeltrettighet til hovedenhet B
export default function (data) {
    const dagligleder = data.testdata.authParties_hovedenhetB.dagligleder;
    let [authorizedPartiesClient] = getClients(dagligleder.userid, dagligleder.partyid, dagligleder.partyuuid, dagligleder.pid);

    const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
        .includeRoles(true)
        .includeAccessPackages(true)
        .includeResources(true)
        .build();

    const authorizedParties = GetAuthorizedParties(authorizedPartiesClient, queryParams);

    if (authorizedParties === null) {
        return;
    }

    const parties = authorizedParties.data ?? [];

    // The access sits on underenhet C alone. Hovedenhet C is only there to carry the
    // hierarchy and is expected without any access of its own.
    const hovedenhet = data.testdata.authParties_hovedenhetC;
    const underenhet = hovedenhet.authParties_underenhetC;

    AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, hovedenhet.partyuuid);
    AuthorizedPartiesDomainChecks.CheckSubPartyIsPresent(parties, hovedenhet.partyuuid, underenhet.partyuuid);
    AuthorizedPartiesDomainChecks.CheckPartyHasNoAccess(parties, hovedenhet.partyuuid);

    AuthorizedPartiesDomainChecks.CheckPartyHasAccessPackages(parties, underenhet.partyuuid, [
        "elektronisk-kommunikasjon",
        "finansiering-og-forsikring",
        "informasjon-og-kommunikasjon",
        "kommuneoverlege",
        "pleie-omsorgstjenester-i-institusjon",
    ]);
    AuthorizedPartiesDomainChecks.CheckPartyHasResources(parties, underenhet.partyuuid, [
        "app_ttd_security-level3-app",
    ]);
    AuthorizedPartiesDomainChecks.CheckPartyHasRoles(parties, underenhet.partyuuid, []);
    AuthorizedPartiesDomainChecks.CheckPartyHasInstances(parties, underenhet.partyuuid, []);
    AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(parties);
}
