import { group } from "k6";

import { EndUserAuthorizedPartiesQueryBuilder } from "../../../../../clients/access-management/enduser/authorized-parties/authorized-parties-query-builder.js";
import { getItemFromList, getOptions } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/enduser/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks } from "../../../../domain-checks/access-management/enduser/authorized-parties.js";
import { getAuthorizedPartiesClient, getDagligLederTokenOpts, setup } from "./common.js";

export { setup };

// Hovedenhet ---> ADOS underenhet (key role inheritance)
// The daglig leder of the hovedenhet an ADOS unit (administrativ enhet - offentlig sektor)
// belongs to sees the ADOS unit as a subunit of the hovedenhet in the authorized parties
// list, the same way as for BEDR and AAFY. This is the read side of the feature flag
// AccessManagement.Subunit.AdosInheritance.
const groupLabel = "dagl-av-hovedenhet-får-ADOS-underenhet-i-aktørlista";

const getAuthorizedPartiesLabel = { step: "1. Get authorized parties" };

export const options = getOptions([getAuthorizedPartiesLabel]);

/**
 * @param {ReturnType<typeof setup>} data Test data from setup.
 */
export default function (data) {
    const row = getItemFromList(data.adosSubunits);
    const { authorizedParties, tokenGenerator } = getAuthorizedPartiesClient();

    tokenGenerator.setTokenGeneratorOptions(getDagligLederTokenOpts(row));

    group(groupLabel, function () {
        const queryParams = new EndUserAuthorizedPartiesQueryBuilder()
            .includeSubParties("true")
            .includeRoles(true)
            .build();

        const response = GetAuthorizedParties(authorizedParties, queryParams, getAuthorizedPartiesLabel);

        if (response === null) {
            return;
        }

        const parties = response.data ?? [];

        AuthorizedPartiesDomainChecks.CheckPartyIsPresent(parties, row.hovedenhetPartyUuid);
        AuthorizedPartiesDomainChecks.CheckSubPartyIsPresent(parties, row.hovedenhetPartyUuid, row.partyUuid);
    });
}
