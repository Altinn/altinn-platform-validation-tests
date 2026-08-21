export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks, PartyUuidList } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// The same subject resolves to the same party list whichever identifier form is used: a
// person by national identity number, user id, party id and person uuid, an organisation
// by number and uuid, and an enterprise user by user name and uuid.
//
// This matrix only exists on the service owner surface, since the subject is named in the
// request body rather than taken from the token. The system user uuid form is covered by
// party-kinds and is not repeated here.
//
// The groups run in order: each baseline records the party list the following groups
// compare against. The baselines are locals rather than module state, so every iteration
// and every VU establishes its own.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("The same subject resolves to the same party list whichever identifier form is used", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const person = firm.dagligleder;
        const enterpriseUser = data.testdata.a2BrunoECUser;

        const queryParams = new AuthorizedPartiesQueryBuilder().includeAccessPackages().build();

        const lookup = (request) => GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        let personBaseline = null;
        let organisationBaseline = null;
        let enterpriseUserBaseline = null;

        group("A person can be looked up by national identity number", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withPerson(person.pid).build());

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);

            personBaseline = PartyUuidList(parties);
        });

        if (personBaseline === null || personBaseline.length === 0) {
            // Without a baseline the comparisons below would pass against an empty list and
            // say nothing. The baseline group's own failed check is the signal.
            return;
        }

        group("The user id form resolves to the same parties", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withUserId(person.userId).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, personBaseline);
        });

        group("The party id form resolves to the same parties", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withPartyId(person.partyId).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, personBaseline);
        });

        group("The person uuid form resolves to the same parties", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withPersonUuid(person.partyUuid).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, personBaseline);
        });

        group("An organisation can be the subject too", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withOrganization(firm.orgno).build());

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);

            organisationBaseline = PartyUuidList(parties);
        });

        group("The organisation uuid form resolves to the same parties", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withOrganizationUuid(firm.partyUuid).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, organisationBaseline ?? []);
        });

        // Both enterprise user forms resolve to an empty list at at22 today, because the
        // fixture user holds no access, so the pair below agrees on nothing. The steps are
        // kept because they still catch one form diverging from the other the moment the
        // fixture is given access, but the equivalence is not exercised as things stand.
        // Deliberately not asserted non empty, which would be a fixture failure dressed up as
        // a product one. The Bruno suite this was ported from has the same gap.
        group("An enterprise user can be the subject too", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withEnterpriseUserUsername(enterpriseUser.username).build());

            AuthorizedPartiesDomainChecks.CheckResponseIsPartyArray(parties);

            enterpriseUserBaseline = PartyUuidList(parties);
        });

        group("The enterprise user uuid form resolves to the same parties", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withEnterpriseUserUuid(enterpriseUser.partyUuid).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, enterpriseUserBaseline ?? []);
        });
    });
}
