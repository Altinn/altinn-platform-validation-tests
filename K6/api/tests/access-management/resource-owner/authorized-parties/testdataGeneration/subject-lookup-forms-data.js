import { fail } from "k6";

import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { CcrHolderRoles } from "../../../../../../clients/register/types.js";
import { fetchTestData, requireEnv } from "../../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../../building-blocks/access-management/resource-owner/authorized-parties/index.js";
import { RegisterBuildingBlocks } from "../../../../../building-blocks/register/index.js";
import { getLookupClient, getPartyLookupAdminClient } from "../../../../register/commons.js";
import { getClients } from "../common.js";

// Generates the rows subject-lookup-forms.js reads, one file per environment.
//
// Not a test of anything. The scenario needs, per row, a person and an organisation
// the service owner surface answers a non-empty party list for, described by every
// identifier form the eight lookups use: the person by national identity number,
// user id, party id and person uuid, the organisation by number and uuid.
//
// Nothing here is seeded. The organisations come from register/organizations-<env>.csv,
// which already exists in all four environments, and their daglig leder is whoever
// Enhetsregisteret says it is. Register supplies the identifiers, and the endpoint
// under test decides which candidates survive: a row is only kept when both its
// person and its organisation answer non-empty, since an empty baseline makes the
// comparisons in the scenario pass against nothing.

/**
 * How many rows to emit. Ten is what the committed files hold.
 */
const ROWS = __ENV.ROWS ? parseInt(__ENV.ROWS) : 10;

export const options = {
    setupTimeout: "300s",
    teardownTimeout: "300s",
    vus: 1,
    iterations: 1,
};

/**
 * @typedef {object} Candidate
 * @property {string} orgno Organisation number.
 * @property {string} orgPartyUuid Party uuid of the organisation.
 * @property {string} pid National identity number of its daglig leder.
 * @property {number} userId Altinn user id of the daglig leder.
 * @property {number} partyId Party id of the daglig leder.
 * @property {string} partyUuid Party uuid of the daglig leder.
 */

/**
 * Collects the candidates from Register.
 *
 * Two reads rather than one: the daglig leder of an organisation only comes from
 * the holder endpoint, one call per organisation, while the organisations
 * themselves resolve in a single bulk query. The query takes at most 100
 * identifiers, which the thirty rows in the source file stay well inside, so the
 * batching is a guard rather than something these files exercise.
 *
 * @returns {Array<Candidate>} The candidates, before the endpoint has seen them.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "REGISTER_SUBSCRIPTION_KEY"]);

    const adminClient = getPartyLookupAdminClient();
    const lookupClient = getLookupClient();

    // The register suite's organisations, read the same way every other fixture is. They
    // are only a starting point here: nothing about the role they hold matters, they are
    // simply thirty organisations that exist in all four environments.
    const organizations = fetchTestData(`register/organizations-${__ENV.ENVIRONMENT}.csv`);

    // Unique, since the source file lists an organisation once per role it holds.
    const orgnos = [...new Set(organizations.map((/** @type {{organizationId: string}} */ o) => o.organizationId))];

    /** @type {Map<string, {partyUuid: string}>} */
    const orgByOrgno = new Map();

    for (let i = 0; i < orgnos.length; i += 100) {
        const batch = orgnos.slice(i, i + 100);

        const parties = RegisterBuildingBlocks.AccessManagementPartiesQuery(
            lookupClient,
            batch.map((orgno) => `urn:altinn:organization:identifier-no:${orgno}`),
            ["identifiers", "party"],
        );

        if (parties === null) {
            fail("cannot continue: the bulk party query failed");
        }

        parties.forEach((party) => {
            if (party.organizationIdentifier !== undefined) {
                orgByOrgno.set(party.organizationIdentifier, { partyUuid: party.partyUuid });
            }
        });
    }

    /** @type {Array<Candidate>} */
    const candidates = [];

    for (const orgno of orgnos) {
        const org = orgByOrgno.get(orgno);

        if (org === undefined) {
            console.log(`${orgno}: Register does not know it, skipped`);
            continue;
        }

        const holders = RegisterBuildingBlocks.GetRoleHolders(
            adminClient,
            org.partyUuid,
            CcrHolderRoles.DAGLIG_LEDER,
            ["identifiers", "party", "person", "user"],
        );

        // Every identifier form the scenario looks up by has to be there, so a holder
        // missing any of them is no use even though Register answered with it.
        const dagligleder = (holders ?? [])
            .map((holder) => ({
                pid: holder.personIdentifier,
                userId: holder.user?.userId,
                partyId: holder.partyId,
                partyUuid: holder.partyUuid,
            }))
            .find((holder) => holder.pid !== undefined && holder.userId !== undefined && holder.partyId !== undefined);

        if (dagligleder === undefined || dagligleder.pid === undefined || dagligleder.userId === undefined || dagligleder.partyId === undefined) {
            console.log(`${orgno}: no daglig leder carrying every identifier form, skipped`);
            continue;
        }

        candidates.push({
            orgno: orgno,
            orgPartyUuid: org.partyUuid,
            pid: dagligleder.pid,
            userId: dagligleder.userId,
            partyId: dagligleder.partyId,
            partyUuid: dagligleder.partyUuid,
        });
    }

    console.log(`Setup complete: ${candidates.length} candidate(s) from ${orgnos.length} organisation(s)`);

    return candidates;
}

/**
 * Keeps the candidates the endpoint under test answers non-empty for.
 *
 * The whole run is one iteration, since the candidates have to be filtered in
 * order and the surviving rows printed as one file.
 *
 * @param {Array<Candidate>} candidates The candidates collected in setup.
 */
export default function (candidates) {
    const [authorizedPartiesClient] = getClients();

    const queryParams = new AuthorizedPartiesQueryBuilder().includeAccessPackages().build();

    /** @type {Array<Candidate>} */
    const kept = [];

    for (const candidate of candidates) {
        if (kept.length === ROWS) {
            break;
        }

        const forPerson = GetAuthorizedParties(
            authorizedPartiesClient,
            new AuthorizedPartiesRequestBuilder().withPerson(candidate.pid).build(),
            queryParams,
        );

        if (forPerson.length === 0) {
            console.log(`${candidate.orgno}: its daglig leder reaches no parties, skipped`);
            continue;
        }

        const forOrganisation = GetAuthorizedParties(
            authorizedPartiesClient,
            new AuthorizedPartiesRequestBuilder().withOrganization(candidate.orgno).build(),
            queryParams,
        );

        if (forOrganisation.length === 0) {
            console.log(`${candidate.orgno}: the organisation itself reaches no parties, skipped`);
            continue;
        }

        kept.push(candidate);
    }

    if (kept.length < ROWS) {
        console.log(`Only ${kept.length} of ${ROWS} rows could be filled from ${candidates.length} candidate(s)`);
    }

    printCsv(kept);
}

/**
 * Prints the rows as the csv the scenario reads.
 *
 * The output is copied into
 * K6/testdata/access-management/resource-owner/authorized-parties/subject-lookup-forms/<env>.csv
 * by hand, since a k6 run cannot write back to the repo.
 *
 * @param {Array<Candidate>} rows The rows that survived.
 */
function printCsv(rows) {
    let csv = "orgno,orgPartyUuid,pid,userId,partyId,partyUuid\n";

    rows.forEach((r) => {
        csv += `${r.orgno},${r.orgPartyUuid},${r.pid},${r.userId},${r.partyId},${r.partyUuid}\n`;
    });

    console.log(`\n${csv}`);
}
