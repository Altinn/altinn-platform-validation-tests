export { handleSummary } from "../../../../../bdd-summary.js";
export { setup } from "./common.js";

import { group } from "k6";

import { scenario } from "../../../../../bdd-summary.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks, PartyUuidList } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SetupData } from "./setup-data.types.js";

// Feature: The same subject resolves to the same party list whichever identifier form is used
//
//   Given a person looked up by national identity number
//   Then looking the same person up by user id, party id and person uuid returns the same parties
//   And an organisation looked up by organisation number returns the same parties as by organisation uuid
//   And an enterprise user looked up by user name returns the same parties as by uuid
//
// This matrix only exists on the service owner surface, since the subject is named in
// the request body rather than taken from the token. The system user uuid form is
// covered by party-kinds and is not repeated here.
//
// The steps run in order: each GIVEN records the party list the following steps compare
// against. The baselines are locals rather than module state, so every iteration and
// every VU establishes its own.

/**
 * Runs the feature.
 *
 * @param {SetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("Feature: The same subject resolves to the same party list whichever identifier form is used", function () {
        const [authorizedPartiesClient] = getClients();

        const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
        const person = firm.dagligleder;
        const enterpriseUser = data.testdata.a2BrunoECUser;

        const queryParams = new AuthorizedPartiesQueryBuilder().includeAccessPackages().build();

        const lookup = (request) => GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        let personBaseline = null;
        let organisationBaseline = null;
        let enterpriseUserBaseline = null;

        scenario({
            name: "A person can be looked up by national identity number",
            given: "a person who is daily leader of the accounting firm",
            when: "a service owner looks that person up by national identity number",
        }, function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withPerson(person.pid).build());

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(
                "THEN a non empty party list comes back",
                parties);

            personBaseline = PartyUuidList(parties);
        });

        if (personBaseline === null || personBaseline.length === 0) {
            // Without a baseline the comparisons below would pass against an empty list and
            // say nothing. The GIVEN's own failed check is the signal.
            return;
        }

        scenario({
            name: "The user id form resolves to the same parties",
            given: "the party list that person's national identity number resolved to",
            when: "a service owner looks the same person up by user id",
        }, function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withUserId(person.userId).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(
                "THEN the party list matches the national identity number lookup",
                parties, personBaseline);
        });

        scenario({
            name: "The party id form resolves to the same parties",
            given: "the party list that person's national identity number resolved to",
            when: "a service owner looks the same person up by party id",
        }, function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withPartyId(person.partyId).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(
                "THEN the party list matches the national identity number lookup",
                parties, personBaseline);
        });

        scenario({
            name: "The person uuid form resolves to the same parties",
            given: "the party list that person's national identity number resolved to",
            when: "a service owner looks the same person up by person uuid",
        }, function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withPersonUuid(person.partyUuid).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(
                "THEN the party list matches the national identity number lookup",
                parties, personBaseline);
        });

        scenario({
            name: "An organisation can be the subject too",
            given: "an organisation with authorized parties of its own",
            when: "a service owner looks that organisation up by organisation number",
        }, function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withOrganization(firm.orgno).build());

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(
                "THEN a non empty party list comes back",
                parties);

            organisationBaseline = PartyUuidList(parties);
        });

        scenario({
            name: "The organisation uuid form resolves to the same parties",
            given: "the party list that organisation's number resolved to",
            when: "a service owner looks the same organisation up by organisation uuid",
        }, function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withOrganizationUuid(firm.partyUuid).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(
                "THEN the party list matches the organisation number lookup",
                parties, organisationBaseline ?? []);
        });

        // Both enterprise user forms resolve to an empty list at at22 today, because the
        // fixture user holds no access, so the pair below agrees on nothing. The steps are
        // kept because they still catch one form diverging from the other the moment the
        // fixture is given access, but the equivalence is not exercised as things stand.
        // Deliberately not asserted non empty, which would be a fixture failure dressed up as
        // a product one. The Bruno suite this was ported from has the same gap.
        scenario({
            name: "An enterprise user can be the subject too",
            given: "an enterprise user belonging to a service owner",
            when: "a service owner looks that enterprise user up by user name",
        }, function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withEnterpriseUserUsername(enterpriseUser.username).build());

            AuthorizedPartiesDomainChecks.CheckResponseIsPartyArray(
                "THEN a party list comes back",
                parties);

            enterpriseUserBaseline = PartyUuidList(parties);
        });

        scenario({
            name: "The enterprise user uuid form resolves to the same parties",
            given: "the party list that enterprise user's user name resolved to",
            when: "a service owner looks the same enterprise user up by uuid",
        }, function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withEnterpriseUserUuid(enterpriseUser.partyUuid).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(
                "THEN the party list matches the user name lookup",
                parties, enterpriseUserBaseline ?? []);
        });
    });
}
