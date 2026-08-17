import { check } from "k6";

import { AuthorizedParty } from "../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties.types.js";

/**
 * Every check here takes the scenario's outcome sentence as its first argument, and
 * uses it as the check name.
 *
 * That is what keeps the suite readable as BDD. The group names the action, so it
 * reads as the GIVEN or the WHEN, and each check names an outcome that was observed,
 * so it reads as a THEN or an AND. The function owns the comparison, the scenario owns
 * the sentence, which is why the same check can appear twice in one group saying two
 * different things.
 */

/**
 * The fields every party in the response is expected to carry.
 *
 * Asserted as an exact set rather than a subset, so a field appearing or
 * disappearing on this contract shows up as a failure here rather than as a
 * puzzling absence somewhere downstream.
 */
const PARTY_FIELDS = [
    "partyUuid",
    "name",
    "organizationNumber",
    "parentId",
    "personId",
    "dateOfBirth",
    "partyId",
    "emailId",
    "type",
    "unitType",
    "isDeleted",
    "onlyHierarchyElementWithNoAccess",
    "authorizedAccessPackages",
    "authorizedResources",
    "authorizedRoles",
    "authorizedInstances",
    "subunits",
];

const PARTY_TYPES = ["None", "Person", "Organization", "SelfIdentified"];

/**
 * Flattens a party hierarchy into a single list, parents before their subunits.
 *
 * @param {AuthorizedParty[]} parties - The parties to flatten.
 * @returns {AuthorizedParty[]} Every party in the hierarchy.
 */
function FlattenParties(parties) {
    return (parties ?? []).flatMap((party) => [party, ...FlattenParties(party.subunits)]);
}

/**
 * Lower cases a party uuid so fixtures and responses compare regardless of case.
 *
 * The API returns uuids lower cased, while some fixtures carry them upper cased.
 *
 * @param {string} partyUuid - The uuid to normalise.
 * @returns {string} The uuid in lower case.
 */
function Normalise(partyUuid) {
    return String(partyUuid).toLowerCase();
}

/**
 * Finds a party anywhere in the hierarchy by its uuid.
 *
 * @param {AuthorizedParty[]} parties - The parties to search.
 * @param {string} partyUuid - The uuid of the party to find.
 * @returns {AuthorizedParty|undefined} The party, or undefined if it is not present.
 */
function FindParty(parties, partyUuid) {
    const wanted = Normalise(partyUuid);

    return FlattenParties(parties).find((party) => Normalise(party.partyUuid) === wanted);
}

/**
 * Every party uuid in the response, main units and their subunits alike, sorted.
 *
 * @param {AuthorizedParty[]} parties - The parties to read.
 * @returns {Array<string>} The uuids, lower cased and sorted.
 */
function PartyUuidList(parties) {
    return FlattenParties(parties).map((party) => Normalise(party.partyUuid)).sort();
}

/**
 * The top level party uuids, ignoring subunits.
 *
 * @param {AuthorizedParty[]} parties - The parties to read.
 * @returns {Array<string>} The top level uuids, lower cased.
 */
function TopLevelPartyUuids(parties) {
    return (parties ?? []).map((party) => Normalise(party.partyUuid));
}

/**
 * Every access entry a party holds, across all four access collections.
 *
 * @param {AuthorizedParty} party - The party to read.
 * @returns {Array<*>} The combined access entries.
 */
function AllAccess(party) {
    return [
        ...(party.authorizedAccessPackages ?? []),
        ...(party.authorizedResources ?? []),
        ...(party.authorizedRoles ?? []),
        ...(party.authorizedInstances ?? []),
    ];
}

/**
 * Compares two lists as unordered sets, ignoring the order the API returned them in.
 *
 * @param {Array<string>} actual - The values returned by the API.
 * @param {Array<string>} expected - The values that were expected.
 * @returns {boolean} True if both lists hold exactly the same values.
 */
function SameMembers(actual, expected) {
    const actualSorted = [...actual].sort();
    const expectedSorted = [...expected].sort();

    return actualSorted.length === expectedSorted.length &&
        actualSorted.every((value, index) => value === expectedSorted[index]);
}

/**
 * Runs one assertion under the scenario's outcome sentence.
 *
 * @param {string} outcome - The THEN or AND sentence, used as the check name.
 * @param {*} target - The value the assertion reads.
 * @param {Function} assertion - Returns true when the outcome held.
 * @param {Function} diagnose - Returns lines to log when it did not.
 * @returns {boolean} True if the outcome held.
 */
function Assert(outcome, target, assertion, diagnose) {
    const success = check(target, { [outcome]: assertion });

    if (!success) {
        console.error(`FAILED: ${outcome}`);
        diagnose().forEach((line) => console.error(`  ${line}`));
    }

    return success;
}

/**
 * True when a deletion date falls inside the window where a deleted party still
 * grants access to its owner.
 *
 * The cutoff is snapped to midnight UTC so the answer is stable for a whole day,
 * and derived from the retention years rather than hardcoded, so the assertions
 * built on it do not depend on the calendar.
 *
 * @param {string} deletedDate - The deletion date, as YYYY-MM-DD.
 * @param {number} retentionYears - How many years a deleted party keeps granting access.
 * @returns {boolean} True if the deletion is recent enough to still grant access.
 */
function IsInsideRetentionWindow(deletedDate, retentionYears) {
    const now = new Date();
    const cutoff = new Date(Date.UTC(
        now.getUTCFullYear() - retentionYears,
        now.getUTCMonth(),
        now.getUTCDate(),
    ));

    return new Date(`${deletedDate}T00:00:00Z`) > cutoff;
}

/**
 * The response is a bare array of parties, whatever it holds.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The response body.
 * @returns {boolean} True if the outcome held.
 */
function CheckResponseIsPartyArray(outcome, parties) {
    return Assert(outcome, parties,
        (body) => Array.isArray(body),
        () => [`expected an array, got: ${JSON.stringify(parties)}`]);
}

/**
 * The response is a non empty bare array of parties.
 *
 * The service owner endpoint returns the parties directly, not wrapped in the
 * paginated envelope the enduser endpoint uses, so this is part of its contract.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The response body.
 * @returns {boolean} True if the outcome held.
 */
function CheckResponseIsNonEmptyPartyArray(outcome, parties) {
    return Assert(outcome, parties,
        (body) => Array.isArray(body) && body.length > 0,
        () => [`expected a non empty array, got: ${JSON.stringify(parties)}`]);
}

/**
 * The response is an empty party array.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The response body.
 * @returns {boolean} True if the outcome held.
 */
function CheckResponseIsEmptyPartyArray(outcome, parties) {
    return Assert(outcome, parties,
        (body) => Array.isArray(body) && body.length === 0,
        () => [`expected an empty array, got: ${JSON.stringify(TopLevelPartyUuids(parties))}`]);
}

/**
 * Every party carries exactly the contract's fields, each with the expected type.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @returns {boolean} True if the outcome held.
 */
function CheckEveryPartyMatchesContract(outcome, parties) {
    const problems = [];

    for (const party of FlattenParties(parties)) {
        const actualFields = Object.keys(party).sort();

        if (!SameMembers(actualFields, PARTY_FIELDS)) {
            const missing = PARTY_FIELDS.filter((field) => !actualFields.includes(field));
            const extra = actualFields.filter((field) => !PARTY_FIELDS.includes(field));

            problems.push(`${party.partyUuid} field mismatch, missing: ${JSON.stringify(missing)}, unexpected: ${JSON.stringify(extra)}`);
        }

        if (typeof party.partyUuid !== "string") {
            problems.push(`${party.name} has no uuid`);
        }

        if (!PARTY_TYPES.includes(party.type)) {
            problems.push(`${party.partyUuid} has unexpected type '${party.type}'`);
        }

        if (typeof party.isDeleted !== "boolean") {
            problems.push(`${party.partyUuid} isDeleted is not a boolean`);
        }

        if (typeof party.onlyHierarchyElementWithNoAccess !== "boolean") {
            problems.push(`${party.partyUuid} onlyHierarchyElementWithNoAccess is not a boolean`);
        }

        for (const collection of ["authorizedAccessPackages", "authorizedResources", "authorizedRoles", "authorizedInstances", "subunits"]) {
            if (!Array.isArray(party[collection])) {
                problems.push(`${party.partyUuid} ${collection} is not an array`);
            }
        }
    }

    return Assert(outcome, parties, () => problems.length === 0, () => problems);
}

/**
 * The party is present anywhere in the response, subunits included.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party expected to be present.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyIsPresent(outcome, parties, partyUuid) {
    return Assert(outcome, parties,
        (body) => FindParty(body, partyUuid) !== undefined,
        () => [
            `'${partyUuid}' was not in the party list`,
            `party uuids returned: ${JSON.stringify(PartyUuidList(parties))}`,
        ]);
}

/**
 * The party is absent from the response, subunits included.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party expected to be absent.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyIsAbsent(outcome, parties, partyUuid) {
    return Assert(outcome, parties,
        (body) => FindParty(body, partyUuid) === undefined,
        () => [`'${partyUuid}' was in the party list and should not have been`]);
}

/**
 * The party is not returned at the top level, since a subunit is only ever returned
 * nested under its main unit.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyIsNotTopLevel(outcome, parties, subunitPartyUuid) {
    return Assert(outcome, parties,
        (body) => !TopLevelPartyUuids(body).includes(Normalise(subunitPartyUuid)),
        () => [
            `subunit '${subunitPartyUuid}' was returned at the top level`,
            `top level party uuids: ${JSON.stringify(TopLevelPartyUuids(parties))}`,
        ]);
}

/**
 * Exactly the expected parties are returned at the top level.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {Array<string>} expectedPartyUuids - The uuids of the only expected top level parties.
 * @returns {boolean} True if the outcome held.
 */
function CheckOnlyTheseTopLevelParties(outcome, parties, expectedPartyUuids) {
    const expected = expectedPartyUuids.map(Normalise);

    return Assert(outcome, parties,
        (body) => SameMembers(TopLevelPartyUuids(body), expected),
        () => [
            `expected: ${JSON.stringify(expected)}`,
            `got: ${JSON.stringify(TopLevelPartyUuids(parties))}`,
        ]);
}

/**
 * The party is returned only as a hierarchy carrier, holding no access of its own,
 * which is how a main unit shows up when the access sits on a subunit.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the main unit.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyIsOnlyHierarchyElement(outcome, parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined &&
            found.onlyHierarchyElementWithNoAccess === true &&
            AllAccess(found).length === 0,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`onlyHierarchyElementWithNoAccess=${party.onlyHierarchyElementWithNoAccess}, access: ${JSON.stringify(AllAccess(party))}`]);
}

/**
 * The party holds the access itself rather than being a hierarchy carrier.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyHoldsAccessItself(outcome, parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined && found.onlyHierarchyElementWithNoAccess === false,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`'${partyUuid}' came back as a hierarchy carrier with no access of its own`]);
}

/**
 * The party is an organization carrying the expected organization number.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedOrganizationNumber - The organization number the party should carry.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyIsOrganizationWithNumber(outcome, parties, partyUuid, expectedOrganizationNumber) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined &&
            found.type === "Organization" &&
            found.organizationNumber === expectedOrganizationNumber,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`expected Organization/${expectedOrganizationNumber}, got ${party.type}/${party.organizationNumber}`]);
}

/**
 * The party has the expected party type.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedType - The expected party type.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyType(outcome, parties, partyUuid, expectedType) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined && found.type === expectedType,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`expected type '${expectedType}', got '${party.type}'`]);
}

/**
 * The party carries no national identity number, which is how a self identified or
 * email registered user comes back.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyHasNoNationalIdentityNumber(outcome, parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined && found.personId === null,
        () => [`expected personId null on '${partyUuid}', got '${party?.personId}'`]);
}

/**
 * The party carries the expected email identifier.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedEmailId - The email identifier the party should carry.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyHasEmailId(outcome, parties, partyUuid, expectedEmailId) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined && found.emailId === expectedEmailId,
        () => [`expected '${expectedEmailId}' on '${partyUuid}', got '${party?.emailId}'`]);
}

/**
 * The party's access packages include all of the expected ones.
 *
 * A subset assertion, since the catalogue wide sets these fixtures hold are not worth
 * pinning exactly.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {Array<string>} expectedAccessPackages - The access packages the party should hold.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyIncludesAccessPackages(outcome, parties, partyUuid, expectedAccessPackages) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined &&
            expectedAccessPackages.every((wanted) => (found.authorizedAccessPackages ?? []).includes(wanted)),
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [
                `expected to hold: ${JSON.stringify(expectedAccessPackages)}`,
                `got: ${JSON.stringify(party.authorizedAccessPackages ?? [])}`,
            ]);
}

/**
 * The party holds at least one access package.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyHasSomeAccessPackages(outcome, parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined && (found.authorizedAccessPackages ?? []).length > 0,
        () => [`expected access packages on '${partyUuid}', got: ${JSON.stringify(party?.authorizedAccessPackages ?? [])}`]);
}

/**
 * The party's roles include the expected role, compared case insensitively.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedRole - The role the party should hold.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyIncludesRole(outcome, parties, partyUuid, expectedRole) {
    const party = FindParty(parties, partyUuid);
    const wanted = expectedRole.toLowerCase();

    return Assert(outcome, party,
        (found) => found !== undefined &&
            (found.authorizedRoles ?? []).some((role) => String(role).toLowerCase() === wanted),
        () => [`expected role '${expectedRole}' on '${partyUuid}', got: ${JSON.stringify(party?.authorizedRoles ?? [])}`]);
}

/**
 * The party holds exactly the expected resources and nothing else.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {Array<string>} expectedResources - The only resources the party should hold.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyHasExactlyResources(outcome, parties, partyUuid, expectedResources) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined && SameMembers(found.authorizedResources ?? [], expectedResources),
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [
                `expected: ${JSON.stringify(expectedResources)}`,
                `got: ${JSON.stringify(party.authorizedResources ?? [])}`,
            ]);
}

/**
 * The party holds some access, across any of the four collections.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyHasSomeAccess(outcome, parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined && AllAccess(found).length > 0,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`expected some delegated access on '${partyUuid}'`]);
}

/**
 * The party has no subunits, which is how a person party comes back.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyHasNoSubunits(outcome, parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert(outcome, party,
        (found) => found !== undefined && (found.subunits ?? []).length === 0,
        () => [`'${partyUuid}' came back with subunits: ${JSON.stringify((party?.subunits ?? []).map((subunit) => subunit.partyUuid))}`]);
}

/**
 * The subunit is nested under the given main unit.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} mainUnitPartyUuid - The uuid of the main unit expected to hold the subunit.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @returns {boolean} True if the outcome held.
 */
function CheckSubunitIsNestedUnderMainUnit(outcome, parties, mainUnitPartyUuid, subunitPartyUuid) {
    const mainUnit = FindParty(parties, mainUnitPartyUuid);
    const wanted = Normalise(subunitPartyUuid);

    return Assert(outcome, mainUnit,
        (found) => (found?.subunits ?? []).some((subunit) => Normalise(subunit.partyUuid) === wanted),
        () => mainUnit === undefined
            ? [`main unit '${mainUnitPartyUuid}' was not in the party list`]
            : [
                `expected '${subunitPartyUuid}' under '${mainUnitPartyUuid}'`,
                `subunits returned: ${JSON.stringify((mainUnit.subunits ?? []).map((subunit) => subunit.partyUuid))}`,
            ]);
}

/**
 * The subunit inherits every access package its main unit holds.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} mainUnitPartyUuid - The uuid of the main unit.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @returns {boolean} True if the outcome held.
 */
function CheckSubunitInheritsMainUnitAccessPackages(outcome, parties, mainUnitPartyUuid, subunitPartyUuid) {
    const mainUnit = FindParty(parties, mainUnitPartyUuid);
    const subunit = FindParty(parties, subunitPartyUuid);

    return Assert(outcome, subunit,
        (found) => found !== undefined && mainUnit !== undefined &&
            (mainUnit.authorizedAccessPackages ?? [])
                .every((wanted) => (found.authorizedAccessPackages ?? []).includes(wanted)),
        () => mainUnit === undefined || subunit === undefined
            ? [`main unit '${mainUnitPartyUuid}' or subunit '${subunitPartyUuid}' was not in the party list`]
            : [
                `main unit holds: ${JSON.stringify(mainUnit.authorizedAccessPackages ?? [])}`,
                `subunit holds: ${JSON.stringify(subunit.authorizedAccessPackages ?? [])}`,
            ]);
}

/**
 * No subunit carries an instance its main unit holds.
 *
 * Access packages and resources extend from a main unit to its subunits, but instance
 * access does not: an instance is delegated to one party and stays there.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @returns {boolean} True if the outcome held.
 */
function CheckNoSubunitInheritsInstances(outcome, parties) {
    const problems = [];
    let inspected = 0;

    for (const party of parties ?? []) {
        const mainUnitInstances = (party.authorizedInstances ?? []).map((instance) => instance.instanceId);

        if (mainUnitInstances.length === 0) {
            continue;
        }

        for (const subunit of party.subunits ?? []) {
            inspected += 1;

            const subunitInstances = (subunit.authorizedInstances ?? []).map((instance) => instance.instanceId);
            const overlap = mainUnitInstances.filter((instance) => subunitInstances.includes(instance));

            if (overlap.length > 0) {
                problems.push(`subunit ${subunit.partyUuid} inherited instances from ${party.partyUuid}: ${overlap.join(", ")}`);
            }
        }
    }

    // A subject with no instance holding main unit that also has subunits gives this
    // nothing to look at, and a loop that never runs would report success. Treated as a
    // failure, because it means the fixture stopped exercising the rule.
    return Assert(outcome, parties,
        () => problems.length === 0 && inspected > 0,
        () => inspected === 0
            ? ["no main unit in the response both holds instances and has subunits, so the rule was never exercised: the fixture or the subject needs revisiting"]
            : problems);
}

/**
 * Every party has all four access collections empty, which is what the include flags
 * being off should produce.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @returns {boolean} True if the outcome held.
 */
function CheckEveryPartyHasNoAccessInformation(outcome, parties) {
    const problems = FlattenParties(parties)
        .filter((party) => AllAccess(party).length > 0)
        .map((party) => `${party.partyUuid} carries ${JSON.stringify(AllAccess(party))}`);

    return Assert(outcome, parties, () => problems.length === 0, () => problems);
}

/**
 * No party in the response carries the given resource.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} resourceId - The resource that should not appear anywhere.
 * @returns {boolean} True if the outcome held.
 */
function CheckNoPartyCarriesResource(outcome, parties, resourceId) {
    const offenders = FlattenParties(parties)
        .filter((party) => (party.authorizedResources ?? []).includes(resourceId))
        .map((party) => party.partyUuid);

    return Assert(outcome, parties,
        () => offenders.length === 0,
        () => [`'${resourceId}' unexpectedly appeared on: ${JSON.stringify(offenders)}`]);
}

/**
 * No party is returned more than once, subunits included.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @returns {boolean} True if the outcome held.
 */
function CheckNoDuplicateParties(outcome, parties) {
    const partyUuids = PartyUuidList(parties);
    const duplicates = partyUuids.filter((partyUuid, index) => partyUuids.indexOf(partyUuid) !== index);

    return Assert(outcome, parties,
        () => duplicates.length === 0,
        () => [`duplicate party uuids: ${JSON.stringify([...new Set(duplicates)])}`]);
}

/**
 * The party list matches a baseline recorded by an earlier step.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {Array<string>} baselinePartyUuids - The sorted uuid list to compare against.
 * @returns {boolean} True if the outcome held.
 */
function CheckPartyUuidsMatchBaseline(outcome, parties, baselinePartyUuids) {
    return Assert(outcome, parties,
        (body) => SameMembers(PartyUuidList(body), baselinePartyUuids),
        () => [
            `baseline: ${JSON.stringify(baselinePartyUuids)}`,
            `got: ${JSON.stringify(PartyUuidList(parties))}`,
        ]);
}

/**
 * The request succeeded, for the steps that only care about the status.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {object} response - The raw HTTP response.
 * @returns {boolean} True if the outcome held.
 */
function CheckRequestSucceeded(outcome, response) {
    return Assert(outcome, response,
        (res) => res.status === 200,
        () => [`expected 200, got ${response.status}`, `body: ${response.body}`]);
}

/**
 * The request was rejected with the expected status.
 *
 * The building block asserts 200 and returns an empty list on anything else, so the
 * steps that mean to be rejected call the client directly and land here.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {object} response - The raw HTTP response.
 * @param {number} expectedStatus - The status the request should have been rejected with.
 * @returns {boolean} True if the outcome held.
 */
function CheckRequestRejected(outcome, response, expectedStatus) {
    return Assert(outcome, response,
        (res) => res.status === expectedStatus,
        () => [`expected ${expectedStatus}, got ${response.status}`, `body: ${response.body}`]);
}

/**
 * The request was rejected as unauthenticated.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {object} response - The raw HTTP response.
 * @returns {boolean} True if the outcome held.
 */
function CheckUnauthorized(outcome, response) {
    return CheckRequestRejected(outcome, response, 401);
}

/**
 * The request was rejected as unauthorized.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {object} response - The raw HTTP response.
 * @returns {boolean} True if the outcome held.
 */
function CheckForbidden(outcome, response) {
    return CheckRequestRejected(outcome, response, 403);
}

/**
 * The request was rejected as a bad request.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {object} response - The raw HTTP response.
 * @returns {boolean} True if the outcome held.
 */
function CheckBadRequest(outcome, response) {
    return CheckRequestRejected(outcome, response, 400);
}

/**
 * The problem body names the value that was refused.
 *
 * @param {string} outcome - The outcome sentence.
 * @param {object} response - The raw HTTP response.
 * @param {string} expectedInBody - A value the problem body is expected to mention.
 * @returns {boolean} True if the outcome held.
 */
function CheckProblemBodyMentions(outcome, response, expectedInBody) {
    return Assert(outcome, response,
        (res) => String(res.body ?? "").includes(expectedInBody),
        () => [`expected '${expectedInBody}' in the problem body, got: ${response.body}`]);
}

export {
    IsInsideRetentionWindow,
    PartyUuidList,
};

export const AuthorizedPartiesDomainChecks = {
    CheckResponseIsPartyArray,
    CheckResponseIsNonEmptyPartyArray,
    CheckResponseIsEmptyPartyArray,
    CheckEveryPartyMatchesContract,
    CheckPartyIsPresent,
    CheckPartyIsAbsent,
    CheckPartyIsNotTopLevel,
    CheckOnlyTheseTopLevelParties,
    CheckPartyIsOnlyHierarchyElement,
    CheckPartyHoldsAccessItself,
    CheckPartyIsOrganizationWithNumber,
    CheckPartyType,
    CheckPartyHasNoNationalIdentityNumber,
    CheckPartyHasEmailId,
    CheckPartyIncludesAccessPackages,
    CheckPartyHasSomeAccessPackages,
    CheckPartyIncludesRole,
    CheckPartyHasExactlyResources,
    CheckPartyHasSomeAccess,
    CheckPartyHasNoSubunits,
    CheckSubunitIsNestedUnderMainUnit,
    CheckSubunitInheritsMainUnitAccessPackages,
    CheckNoSubunitInheritsInstances,
    CheckEveryPartyHasNoAccessInformation,
    CheckNoPartyCarriesResource,
    CheckNoDuplicateParties,
    CheckPartyUuidsMatchBaseline,
    CheckRequestSucceeded,
    CheckRequestRejected,
    CheckUnauthorized,
    CheckForbidden,
    CheckBadRequest,
    CheckProblemBodyMentions,
};
