export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";
import { group } from "k6";

import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/enduser/authorized-parties.js";
import { getClients } from "./common.js";

// Underenhet-D ---> Underenhet-C (U2U)
// Underenhet D delegerer tilgangspakke, ressurs og instanstilgang til underenhet C, og
// daglig leder av underenhet C skal se underenhet D i aktørlista.
const groupLabel = "dagl-C-får-underenhet-D-i-aktørlista";

// The scenario is skipped in the Bruno suite because of a known bug in the API, and is
// kept skipped here until that bug is fixed.
const skipDueToKnownBug = true;

/**
 * @param {ReturnType<typeof import("./common.js").setup>} data Test data from setup.
 */
export default function (data) {
    if (skipDueToKnownBug) {
        console.warn(`${groupLabel} is skipped due to a known bug`);
        return;
    }

    const dagligleder = data.testdata.authParties_hovedenhetC.dagligleder;
    let [authorizedPartiesClient] = getClients(dagligleder.userid, dagligleder.partyid, dagligleder.partyuuid, dagligleder.pid);

    group(groupLabel, function () {
        const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
            .includeRoles(true)
            .includeAccessPackages(true)
            .includeResources(true)
            .includeInstances(true)
            .build();

        const authorizedParties = GetAuthorizedParties(authorizedPartiesClient, queryParams);

        if (authorizedParties === null) {
            return;
        }

        const parties = authorizedParties.data ?? [];

        // Everything that was delegated sits on underenhet D. Hovedenhet D is only there to
        // carry the hierarchy and is expected without any access of its own.
        const hovedenhet = data.testdata.authParties_hovedenhetD;
        const underenhet = hovedenhet.authParties_underenhetD;

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, hovedenhet.partyuuid);
        AuthorizedPartiesDomainChecks.CheckSubPartyIsPresent(parties, hovedenhet.partyuuid, underenhet.partyuuid);
        AuthorizedPartiesDomainChecks.CheckPartyHasNoAccess(parties, hovedenhet.partyuuid);

        AuthorizedPartiesDomainChecks.CheckPartyHasAccessPackages(parties, underenhet.partyuuid, [
            "damp-varmtvann",
            "finansiering-og-forsikring",
            "informasjon-og-kommunikasjon",
            "utvinning-raaolje-naturgass-kull",
        ]);
        AuthorizedPartiesDomainChecks.CheckPartyHasResources(parties, underenhet.partyuuid, [
            "app_ttd_instance-gui-test",
            "app_ttd_security-level3-app",
            "app_ttd_ttd-bruno-tilgangspakke-app",
        ]);
        AuthorizedPartiesDomainChecks.CheckPartyHasRoles(parties, underenhet.partyuuid, []);
        AuthorizedPartiesDomainChecks.CheckPartyHasInstances(parties, underenhet.partyuuid, [
            {
                resourceId: "app_ttd_signering-brukerstyrt",
                instanceRef: data.testdata.instancer.underenhetD_instansid,
            },
        ]);
        AuthorizedPartiesDomainChecks.CheckNoDuplicateParties(parties);
    });
}
