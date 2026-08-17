export { handleSummary } from "../../../../../common-imports.js";
export { setup } from "./common.js";

import { group } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks, PartyUuidList } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";

// Scenario: The same subject resolves to the same party list whichever identifier form is used
//
//   Given a person looked up by national identity number
//   Then looking the same person up by user id, party id and person uuid returns the same parties
//   And an organisation looked up by organisation number returns the same parties as by organisation uuid
//   And an enterprise user looked up by user name returns the same parties as by uuid
//
// This matrix only exists on the service owner surface, since the subject is named in
// the request body rather than taken from the token. The system user uuid form is
// covered by 07-party-kinds and is not repeated here.
//
// The steps run in order: each baseline step records the party list the following
// steps compare against. The baselines are locals rather than module state, so every
// iteration and every VU establishes its own.

export default function (data) {
    const [authorizedPartiesClient] = getClients();

    const firm = data.testdata.REGN_ULASTELIG_RETTFERDIG_TIGER;
    const person = firm.dagligleder;
    const enterpriseUser = data.testdata.a2BrunoECUser;

    const queryParams = new AuthorizedPartiesQueryBuilder().includeAccessPackages().build();

    const lookup = (request) => GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

    let personBaseline = null;
    let organisationBaseline = null;
    let enterpriseUserBaseline = null;

    // GIVEN a person is looked up by national identity number, the party list this
    // returns is the baseline the other identifier forms are compared against.
    group("01 GIVEN a person looked up by national identity number", function () {
        const parties = lookup(new AuthorizedPartiesRequestBuilder().withPerson(person.pid).build());

        AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);

        personBaseline = PartyUuidList(parties);
    });

    if (personBaseline === null || personBaseline.length === 0) {
        // Without a baseline the comparisons below would pass against an empty list and
        // say nothing. Step 01's own failed check is the signal.
        return;
    }

    // AND the same person looked up by user id returns the same parties as the national
    // identity number form did.
    group("02 AND the same person by user id", function () {
        const parties = lookup(new AuthorizedPartiesRequestBuilder().withUserId(person.userId).build());

        AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, personBaseline, "user id");
    });

    // AND the same person looked up by party id returns the same parties.
    group("03 AND the same person by party id", function () {
        const parties = lookup(new AuthorizedPartiesRequestBuilder().withPartyId(person.partyId).build());

        AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, personBaseline, "party id");
    });

    // AND the same person looked up by person uuid returns the same parties.
    group("04 AND the same person by person uuid", function () {
        const parties = lookup(new AuthorizedPartiesRequestBuilder().withPersonUuid(person.partyUuid).build());

        AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, personBaseline, "person uuid");
    });

    // AND an organisation can be the subject too, looked up by organisation number. The
    // party list this returns is the baseline for the organisation uuid form.
    group("05 AND an organisation by organisation number", function () {
        const parties = lookup(new AuthorizedPartiesRequestBuilder().withOrganization(firm.orgno).build());

        // Asserted non empty so the uuid form below is compared against a real list
        // rather than against nothing.
        AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);

        organisationBaseline = PartyUuidList(parties);
    });

    // AND the same organisation looked up by organisation uuid returns the same parties.
    group("06 AND the same organisation by organisation uuid", function () {
        const parties = lookup(new AuthorizedPartiesRequestBuilder().withOrganizationUuid(firm.partyUuid).build());

        AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, organisationBaseline ?? [], "organisation uuid");
    });

    // AND an enterprise user can be the subject, looked up by user name. The party list
    // this returns is the baseline for the enterprise user uuid form.
    //
    // Both enterprise user forms resolve to an empty list at at22 today, because the
    // fixture user holds no access, so the pair below agrees on nothing. The steps are
    // kept because they still catch one form diverging from the other the moment the
    // fixture is given access, but the equivalence is not exercised as things stand.
    // Deliberately not asserted non empty, which would be a fixture failure dressed up
    // as a product one. The Bruno suite this was ported from has the same gap.
    group("07 AND an enterprise user by user name", function () {
        const parties = lookup(new AuthorizedPartiesRequestBuilder().withEnterpriseUserUsername(enterpriseUser.username).build());

        enterpriseUserBaseline = PartyUuidList(parties);
    });

    // AND the same enterprise user looked up by uuid returns the same parties as the user
    // name form did.
    group("08 AND the same enterprise user by uuid", function () {
        const parties = lookup(new AuthorizedPartiesRequestBuilder().withEnterpriseUserUuid(enterpriseUser.partyUuid).build());

        AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, enterpriseUserBaseline ?? [], "enterprise user uuid");
    });
}
