import { fail } from "k6";

import { AuthorizedParty } from "../../../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties.types.js";
import { AuthorizedPartiesQueryBuilder, AuthorizedPartiesRequestBuilder } from "../../../../../../clients/access-management/resource-owner/authorized-parties/index.js";
import { CcrHolderRoles } from "../../../../../../clients/register/types.js";
import { fetchTestData, requireEnv } from "../../../../../../helpers.js";
import { GetAuthorizedParties } from "../../../../../building-blocks/access-management/resource-owner/authorized-parties/index.js";
import { RegisterBuildingBlocks } from "../../../../../building-blocks/register/index.js";
import { getPartyLookupAdminClient } from "../../../../register/commons.js";
import { getClients } from "../common.js";

// Generates the rows the five accounting firm scenarios read, one file per environment:
// clients-and-key-role-parties, access-information-flags, key-role-filter, party-filter
// and resource-filter.
//
// One discovery pass feeds all five, because they all start from the same lookup: an
// accounting firm's daglig leder, and the parties that answers with. Splitting it into
// five generators would mean five copies of that pass and five times the traffic against
// the environment for the same parties.
//
// Nothing is described by hand. The firms are the regnskapsfører organisations the
// register suite already carries, their daglig leder comes from Register, and every other
// column is read off the endpoint under test: which client carries the accountant
// packages, which subunit hangs under it, which party is the sole proprietorship owner,
// which parties are only reachable through a key role, and which resource a party carries.
// The endpoint is the only thing that knows, since none of it is written down anywhere.

/**
 * The packages an accountant holds on its clients. The same list
 * clients-and-key-role-parties.js asserts, and what makes a party a client here rather
 * than something else the daglig leder happens to reach.
 */
const ACCOUNTANT_PACKAGES = [
    "regnskapsforer-lonn",
    "regnskapsforer-med-signeringsrettighet",
    "regnskapsforer-uten-signeringsrettighet",
];

/**
 * How many rows to emit per scenario.
 */
const ROWS = __ENV.ROWS ? parseInt(__ENV.ROWS) : 10;

export const options = {
    setupTimeout: "600s",
    vus: 1,
    iterations: 1,
};

/**
 * An accounting firm and its daglig leder, before the endpoint has been asked anything.
 *
 * @typedef {object} FirmCandidate
 * @property {string} orgno Organisation number of the firm.
 * @property {string} orgPartyUuid Party uuid of the firm.
 * @property {string} pid National identity number of its daglig leder.
 */

/**
 * Everything the five scenarios need, discovered from one firm.
 *
 * @typedef {object} Discovery
 * @property {string} orgno
 * @property {string} pid
 * @property {string} firmPartyUuid
 * @property {string} firmSubunitPartyUuid
 * @property {string} clientOrgno
 * @property {string} clientPartyUuid
 * @property {string} clientSubunitPartyUuid
 * @property {string} innehaverPartyUuid Sole proprietorship owner, returned as a person.
 * @property {string} keyRoleOnlyPartyUuid A second party reachable only through a key role.
 * @property {string} directDelegatorPartyUuid A party that delegated to the person directly.
 * @property {string} directDelegatorPackage One package it delegated.
 * @property {string} resourceHolderPartyUuid A party carrying a resource the person holds.
 * @property {string} resourceId The resource it carries.
 * @property {Array<string>} reachablePartyUuids Every party the person reaches, subunits included.
 * @property {Array<string>} heldResourceIds Every resource the person holds, on any party.
 */

/**
 * Collects the firms to try, in the order they will be tried.
 *
 * @returns {Array<FirmCandidate>} The candidates.
 */
export function setup() {
    requireEnv(["ENVIRONMENT", "BASE_URL", "REGISTER_SUBSCRIPTION_KEY"]);

    const adminClient = getPartyLookupAdminClient();

    // Every organisation in the file, not only the ones listed as regnskapsfører. What
    // matters is who the daglig leder is, and in these environments the same handful of
    // people lead many organisations, so a firm listed under another role can still have
    // a leader who is an accountant somewhere. Whether that is so is decided further down
    // by what the endpoint answers, not by the role column here.
    const firms = fetchTestData(`register/organizations-${__ENV.ENVIRONMENT}.csv`);

    /** @type {Array<FirmCandidate>} */
    const candidates = [];

    // A person who leads several of these organisations would otherwise fill several rows
    // with the same lookup, which is ten rows that only say one thing.
    const seenPids = new Set();

    for (const firm of firms) {
        const holders = RegisterBuildingBlocks.GetRoleHolders(
            adminClient,
            firm.organizationUuid,
            CcrHolderRoles.DAGLIG_LEDER,
            ["identifiers", "party", "person"],
        );

        const pid = (holders ?? []).map((holder) => holder.personIdentifier).find((p) => p !== undefined);

        if (pid === undefined) {
            console.log(`${firm.organizationId}: no daglig leder, skipped`);
            continue;
        }

        if (seenPids.has(pid)) {
            console.log(`${firm.organizationId}: its daglig leder already fills a row, skipped`);
            continue;
        }

        seenPids.add(pid);

        candidates.push({ orgno: firm.organizationId, orgPartyUuid: firm.organizationUuid, pid: pid });
    }

    if (candidates.length === 0) {
        fail("cannot continue: no accounting firm has a daglig leder");
    }

    console.log(`Setup complete: ${candidates.length} firm(s) to try`);

    return candidates;
}

/**
 * Runs the discovery and prints one csv per scenario.
 *
 * @param {Array<FirmCandidate>} candidates The firms collected in setup.
 */
export default function (candidates) {
    const [authorizedPartiesClient] = getClients();

    /** @type {Array<Discovery>} */
    const discovered = [];

    for (const candidate of candidates) {
        if (discovered.length === ROWS) {
            break;
        }

        const discovery = discover(authorizedPartiesClient, candidate);

        if (discovery !== null) {
            discovered.push(discovery);
        }
    }

    if (discovered.length < ROWS) {
        console.log(`Only ${discovered.length} of ${ROWS} rows could be filled from ${candidates.length} firm(s)`);
    }

    printCsvs(discovered);
}

/**
 * Asks the endpoint everything one firm can answer, and keeps the firm only if it can
 * answer all of it.
 *
 * Three lookups: the full one every column but two is read from, the same lookup with key
 * role parties excluded, which is the only way to tell a client the firm reaches from a
 * party that delegated to the person directly, and one filtered on a resource, to confirm
 * the resource actually narrows rather than being one the whole catalogue carries.
 *
 * @param {*} authorizedPartiesClient Client for the authorized parties API.
 * @param {FirmCandidate} candidate The firm to try.
 * @returns {Discovery|null} The row, or null when this firm cannot fill one.
 */
function discover(authorizedPartiesClient, candidate) {
    const request = new AuthorizedPartiesRequestBuilder().withPerson(candidate.pid).build();

    const withKeyRoles = GetAuthorizedParties(
        authorizedPartiesClient,
        request,
        new AuthorizedPartiesQueryBuilder()
            .includeRoles()
            .includeAccessPackages()
            .includeResources()
            .includePartiesViaKeyRoles("true")
            .build(),
    );

    const withoutKeyRoles = GetAuthorizedParties(
        authorizedPartiesClient,
        request,
        new AuthorizedPartiesQueryBuilder()
            .includeAccessPackages()
            .includeResources()
            .includePartiesViaKeyRoles("false")
            .build(),
    );

    const skip = (/** @type {string} */ reason) => {
        console.log(`${candidate.orgno}: ${reason}, skipped`);
        return null;
    };

    // The firm itself has to come back carrying a subunit, since three of the scenarios
    // assert that the subunit is nested under it.
    const firm = withKeyRoles.find((party) => party.organizationNumber === candidate.orgno);

    if (firm === undefined || (firm.subunits ?? []).length === 0) {
        return skip("the firm is missing or has no subunit");
    }

    // What the firm reaches, rather than what the person does, is exactly what drops out
    // when key role parties are excluded.
    //
    // Subunits count as reached: the scenarios' presence and absence checks flatten the
    // hierarchy, so a party that comes back nested under a main unit has not dropped out.
    const reachedWithoutKeyRoles = new Set(flatten(withoutKeyRoles).map((party) => party.partyUuid));

    if (!reachedWithoutKeyRoles.has(firm.partyUuid)) {
        return skip("the firm itself drops out when key roles are excluded");
    }

    // A client is a party carrying the accountant packages, which is what the firm's
    // clients hold and nothing else does. It needs a subunit carrying them too, because
    // party-filter asserts the subunit comes back nested under it, and it has to be one of
    // the parties the firm reaches, since key-role-filter asserts it drops out without the
    // firm in between. All three are one search rather than three, because a firm whose
    // first client fails one of them may well have a second that passes.
    const client = withKeyRoles.find((party) =>
        party.partyUuid !== firm.partyUuid
        && party.organizationNumber !== null
        && !reachedWithoutKeyRoles.has(party.partyUuid)
        && holdsAll(party, ACCOUNTANT_PACKAGES)
        && (party.subunits ?? []).some((subunit) => holdsAll(subunit, ACCOUNTANT_PACKAGES)));

    if (client === undefined) {
        return skip("no client the firm alone reaches carries the accountant packages on both itself and a subunit");
    }

    const clientSubunit = (client.subunits ?? []).find((subunit) => holdsAll(subunit, ACCOUNTANT_PACKAGES));

    // The owner of a sole proprietorship client comes back as a person carrying the same
    // packages, which is what separates it from the daglig leder's own party.
    const innehaver = withKeyRoles.find((party) => party.type === "Person" && holdsAll(party, ACCOUNTANT_PACKAGES));

    if (innehaver === undefined) {
        return skip("no sole proprietorship owner is returned as a person");
    }

    // key-role-filter asserts on two parties that drop out, so that it says more than the
    // one client the other scenarios already use.
    const keyRoleOnly = withKeyRoles.find((party) =>
        party.partyUuid !== client.partyUuid
        && party.organizationNumber !== null
        && !reachedWithoutKeyRoles.has(party.partyUuid));

    if (keyRoleOnly === undefined) {
        return skip("only one party is reachable through a key role");
    }

    // A direct delegator is what survives that exclusion while still carrying access, so
    // it reached the person without the firm in between.
    const directDelegator = withoutKeyRoles.find((party) =>
        party.partyUuid !== firm.partyUuid
        && (party.authorizedAccessPackages ?? []).length > 0);

    if (directDelegator === undefined) {
        return skip("nothing delegated to the person directly");
    }

    // A resource is only useful to resource-filter if some party carries one, and the
    // filter has to actually narrow: a resource every party holds would make the scenario
    // assert nothing. Unlike everything above this is optional, because a resource is
    // delegated per resource and an accounting firm picked out of Enhetsregisteret has no
    // reason to hold one. The other four scenarios still get their row.
    const resource = discoverResource(authorizedPartiesClient, request, withKeyRoles, client, candidate.orgno);

    return {
        orgno: candidate.orgno,
        pid: candidate.pid,
        firmPartyUuid: firm.partyUuid,
        firmSubunitPartyUuid: (firm.subunits ?? [])[0].partyUuid,
        clientOrgno: client.organizationNumber ?? "",
        clientPartyUuid: client.partyUuid,
        clientSubunitPartyUuid: clientSubunit === undefined ? "" : clientSubunit.partyUuid,
        innehaverPartyUuid: innehaver.partyUuid,
        keyRoleOnlyPartyUuid: keyRoleOnly.partyUuid,
        directDelegatorPartyUuid: directDelegator.partyUuid,
        directDelegatorPackage: (directDelegator.authorizedAccessPackages ?? [])[0],
        resourceHolderPartyUuid: resource === null ? "" : resource.partyUuid,
        resourceId: resource === null ? "" : resource.resourceId,
        // Not columns. Two of the columns name a party or a person the subject must not
        // reach, which no single lookup can answer, so they are filled in from another row
        // once every row is in. These two are what makes that checkable rather than assumed.
        reachablePartyUuids: flatten(withKeyRoles).map((party) => party.partyUuid),
        heldResourceIds: [...new Set(withKeyRoles.flatMap((party) => party.authorizedResources ?? []))],
    };
}

/**
 * Finds a resource the subject holds that the filter actually narrows on.
 *
 * @param {*} authorizedPartiesClient Client for the authorized parties API.
 * @param {*} request The subject lookup, reused with the filter applied.
 * @param {Array<AuthorizedParty>} parties The unfiltered party list.
 * @param {AuthorizedParty} client The client that has to drop out for the filter to mean anything.
 * @param {string} orgno The firm being tried, for the log line.
 * @returns {{partyUuid: string, resourceId: string}|null} The party and resource, or null when there is none.
 */
function discoverResource(authorizedPartiesClient, request, parties, client, orgno) {
    const holder = parties.find((party) => (party.authorizedResources ?? []).length > 0);

    if (holder === undefined) {
        console.log(`${orgno}: no party carries a resource, so it fills no resource filter row`);
        return null;
    }

    const resourceId = (holder.authorizedResources ?? [])[0];

    const filtered = GetAuthorizedParties(
        authorizedPartiesClient,
        request,
        new AuthorizedPartiesQueryBuilder().includeResources().addResourceId(resourceId).build(),
    );

    const narrowedTo = new Set(filtered.map((party) => party.partyUuid));

    if (!narrowedTo.has(holder.partyUuid)) {
        console.log(`${orgno}: filtering on ${resourceId} drops the party that carries it, so it fills no resource filter row`);
        return null;
    }

    if (narrowedTo.has(client.partyUuid)) {
        console.log(`${orgno}: filtering on ${resourceId} does not drop the client, so it fills no resource filter row`);
        return null;
    }

    return { partyUuid: holder.partyUuid, resourceId: resourceId };
}

/**
 * Every party in the response, main units and their subunits alike.
 *
 * The scenarios' presence and absence checks flatten the hierarchy, so the discovery has
 * to see it the same way: a party returned nested under a main unit is returned.
 *
 * @param {Array<AuthorizedParty>} parties The parties to flatten.
 * @returns {Array<AuthorizedParty>} Every party, at one level.
 */
function flatten(parties) {
    return parties.flatMap((party) => [party, ...(party.subunits ?? [])]);
}

/**
 * Whether a party carries every one of these access packages.
 *
 * @param {AuthorizedParty} party The party to look at.
 * @param {Array<string>} packages The packages it has to carry.
 * @returns {boolean} Whether it carries all of them.
 */
function holdsAll(party, packages) {
    const held = party.authorizedAccessPackages ?? [];

    return packages.every((wanted) => held.includes(wanted));
}

/**
 * Prints one csv per scenario, each with only the columns that scenario reads.
 *
 * One file per scenario rather than one wide file they all share, so a scenario's fixture
 * says what that scenario needs, and regenerating one does not silently move the ground
 * under the others.
 *
 * The output is copied into
 * K6/testdata/access-management/resource-owner/authorized-parties/<scenario>/<env>.csv by
 * hand, since a k6 run cannot write back to the repo.
 *
 * @param {Array<Discovery>} rows The discovered rows.
 */
function printCsvs(rows) {
    /** @type {{[scenario: string]: Array<string>}} */
    const columns = {
        "clients-and-key-role-parties": ["pid", "orgno", "firmPartyUuid", "firmSubunitPartyUuid", "clientOrgno", "clientPartyUuid", "clientSubunitPartyUuid", "innehaverPartyUuid"],
        "access-information-flags": ["pid", "firmPartyUuid", "clientPartyUuid"],
        "key-role-filter": ["pid", "firmPartyUuid", "clientPartyUuid", "keyRoleOnlyPartyUuid", "directDelegatorPartyUuid", "directDelegatorPackage"],
        "party-filter": ["pid", "clientPartyUuid", "clientSubunitPartyUuid", "unreachablePartyUuid"],
        "resource-filter": ["pid", "resourceHolderPartyUuid", "resourceId", "clientPartyUuid", "pidWithoutResource"],
    };

    // The two columns no single lookup can answer: a party the subject cannot reach, and a
    // person who does not hold the resource. Both are borrowed from another row, so they
    // are real parties and real people rather than invented ones, and both are checked
    // against what that other row actually saw rather than assumed. The same handful of
    // people lead many of these organisations, so a subject reaching another row's firm is
    // common enough that assuming it away produced a scenario that failed two rows in ten.
    /** @type {Array<{[column: string]: string}>} */
    const enriched = rows.map((row) => {
        const unreachable = rows.find((other) =>
            other.pid !== row.pid && !row.reachablePartyUuids.includes(other.firmPartyUuid));

        const withoutResource = row.resourceId === "" ? undefined : rows.find((other) =>
            other.pid !== row.pid && !other.heldResourceIds.includes(row.resourceId));

        if (unreachable === undefined) {
            console.log(`${row.orgno}: reaches every other row's firm, so it fills no party filter row`);
        }

        if (row.resourceId !== "" && withoutResource === undefined) {
            console.log(`${row.orgno}: every other row's subject holds ${row.resourceId}, so it fills no resource filter row`);
        }

        // The two lists are dropped here rather than carried into the csv: they are how the
        // borrowing was checked, not something a scenario reads.
        const { reachablePartyUuids, heldResourceIds, ...columns } = row;

        return {
            ...columns,
            unreachablePartyUuid: unreachable === undefined ? "" : unreachable.firmPartyUuid,
            pidWithoutResource: withoutResource === undefined ? "" : withoutResource.pid,
        };
    });

    for (const [scenario, header] of Object.entries(columns)) {
        // A firm can fail one scenario while filling the others, so each file is whatever
        // subset of the rows can answer its columns rather than all of them.
        const applicable = enriched.filter((row) => header.every((column) => row[column] !== ""));

        let csv = `${header.join(",")}\n`;

        applicable.forEach((row) => {
            csv += `${header.map((column) => row[column]).join(",")}\n`;
        });

        console.log(`\n=== ${scenario} (${applicable.length} row(s)) ===\n${csv}`);
    }
}
