export { handleSummary } from "../../../../../common-imports.js";

import { group } from "k6";

import { AuthorizedPartiesRequest } from "../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties.types.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { fetchTestData, getItemFromList, requireEnv } from "../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../building-blocks/access-management/resource-owner/authorized-parties/get-authorized-parties.js";
import { AuthorizedPartiesDomainChecks, PartyUuidList } from "../../../../domain-checks/access-management/resource-owner/authorized-parties.js";
import { getClients } from "./common.js";
import { SubjectLookupFormsSetupData } from "./setup-data.types.js";

// The same subject resolves to the same party list whichever identifier form is used: a
// person by national identity number, user id, party id and person uuid, and an
// organisation by number and uuid.
//
// This matrix only exists on the service owner surface, since the subject is named in the
// request body rather than taken from the token. The system user uuid form is covered by
// party-kinds and is not repeated here.
//
// The groups run in order: each baseline records the party list the following groups
// compare against. The baselines are locals rather than module state, so every iteration
// and every VU establishes its own.
//
// Unlike the rest of the suite this reads a csv rather than the accounting firm fixture,
// because nothing here depends on how the parties are related: it needs one person and
// one organisation the endpoint answers non-empty for, described by every identifier form.
// That is generated rather than hand written, and exists for all four environments, which
// the json fixture does not.

const randomize = (__ENV.RANDOMIZE ?? "true") === "true";

/**
 * Runs the feature.
 *
 * @param {SubjectLookupFormsSetupData} data - The fixtures returned by setup().
 */
export default function (data) {
    group("The same subject resolves to the same party list whichever identifier form is used", function () {
        const [authorizedPartiesClient] = getClients();

        // One row per iteration rather than all ten, so the group names stay the same
        // whichever row is drawn and a run costs the same as it did against the fixture.
        const row = getItemFromList(data.subjectLookupForms, randomize);

        const queryParams = new AuthorizedPartiesQueryBuilder().includeAccessPackages().build();

        const lookup = (/** @type {AuthorizedPartiesRequest} */ request) => GetAuthorizedParties(authorizedPartiesClient, request, queryParams);

        // Each baseline is the group's return value rather than a variable assigned inside
        // the callback, which control flow analysis does not follow.
        const personBaseline = group("A person can be looked up by national identity number", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withPerson(row.pid).build());

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);

            return PartyUuidList(parties);
        });

        if (personBaseline.length === 0) {
            // Without a baseline the comparisons below would pass against an empty list and
            // say nothing. The baseline group's own failed check is the signal.
            return;
        }

        group("The user id form resolves to the same parties", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withUserId(row.userId).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, personBaseline);
        });

        group("The party id form resolves to the same parties", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withPartyId(row.partyId).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, personBaseline);
        });

        group("The person uuid form resolves to the same parties", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withPersonUuid(row.partyUuid).build());

            AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, personBaseline);
        });

        const organisationBaseline = group("An organisation can be the subject too", function () {
            const parties = lookup(new AuthorizedPartiesRequestBuilder().withOrganization(row.orgno).build());

            AuthorizedPartiesDomainChecks.CheckResponseIsNonEmptyPartyArray(parties);

            return PartyUuidList(parties);
        });

        // Same reasoning as the person baseline above, but skipping the one group rather
        // than returning, in case a form is added after it.
        if (organisationBaseline.length > 0) {
            group("The organisation uuid form resolves to the same parties", function () {
                const parties = lookup(new AuthorizedPartiesRequestBuilder().withOrganizationUuid(row.orgPartyUuid).build());

                AuthorizedPartiesDomainChecks.CheckPartyUuidsMatchBaseline(parties, organisationBaseline);
            });
        }
    });
}

/**
 * Fetches the rows this scenario draws from.
 *
 * Its own setup rather than the suite's, since the rows are all it reads. That is what
 * lets it run in every environment the csv exists for, while the rest of the suite is
 * pinned to the one environment its json fixture describes.
 *
 * @returns {SubjectLookupFormsSetupData} The rows, as the default function's `data` argument.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL"]);

    return {
        subjectLookupForms: fetchTestData(`access-management/resource-owner/authorized-parties/subject-lookup-forms/${__ENV.ENVIRONMENT}.csv`, true, "test/subject-lookup-forms-from-csv"),
    };
}
