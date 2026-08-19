import { check } from "k6";

import { AuthorizedParty } from "../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties.types.js";

/**
 * Every check here names itself, after the function and what it compared, so it can be
 * called like any other domain check and needs nothing from the caller but the data.
 *
 * Each one also takes an optional trailing name, which replaces the default one. That
 * is what a BDD suite passes its outcome sentence in as, so the summary reads as THEN
 * and AND rather than as a list of function names, and it is why the same check can
 * appear twice in one scenario saying two different things. Nothing else needs it: a
 * test with no sentence to give leaves it out and gets the default.
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
 * Runs one assertion under the name the check is reported by.
 *
 * @param {string} name - The check name, either the check's own or the caller's override.
 * @param {*} target - The value the assertion reads.
 * @param {Function} assertion - Returns true when the check held.
 * @param {Function} diagnose - Returns lines to log when it did not.
 * @returns {boolean} True if the check held.
 */
function Assert(name, target, assertion, diagnose) {
    const success = check(target, { [name]: assertion });

    if (!success) {
        console.error(`FAILED: ${name}`);
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
 * @param {AuthorizedParty[]} parties - The response body.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckResponseIsPartyArray(parties, as = null) {
    return Assert(as ?? "CheckResponseIsPartyArray - the response is an array of parties", parties,
        (body) => Array.isArray(body),
        () => [`expected an array, got: ${JSON.stringify(parties)}`]);
}

/**
 * The response is a non empty bare array of parties.
 *
 * The service owner endpoint returns the parties directly, not wrapped in the
 * paginated envelope the enduser endpoint uses, so this is part of its contract.
 *
 * @param {AuthorizedParty[]} parties - The response body.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckResponseIsNonEmptyPartyArray(parties, as = null) {
    return Assert(as ?? "CheckResponseIsNonEmptyPartyArray - the response is a non empty array of parties", parties,
        (body) => Array.isArray(body) && body.length > 0,
        () => [`expected a non empty array, got: ${JSON.stringify(parties)}`]);
}

/**
 * The response is an empty party array.
 *
 * @param {AuthorizedParty[]} parties - The response body.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckResponseIsEmptyPartyArray(parties, as = null) {
    return Assert(as ?? "CheckResponseIsEmptyPartyArray - the response is an empty array of parties", parties,
        (body) => Array.isArray(body) && body.length === 0,
        () => [`expected an empty array, got: ${JSON.stringify(TopLevelPartyUuids(parties))}`]);
}

/**
 * Every party carries exactly the contract's fields, each with the expected type.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckEveryPartyMatchesContract(parties, as = null) {
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

    return Assert(as ?? "CheckEveryPartyMatchesContract - every party matches the contract", parties, () => problems.length === 0, () => problems);
}

/**
 * The party is present anywhere in the response, subunits included.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party expected to be present.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyIsPresent(parties, partyUuid, as = null) {
    return Assert(as ?? `CheckPartyIsPresent - '${partyUuid}' is in the party list`, parties,
        (body) => FindParty(body, partyUuid) !== undefined,
        () => [
            `'${partyUuid}' was not in the party list`,
            `party uuids returned: ${JSON.stringify(PartyUuidList(parties))}`,
        ]);
}

/**
 * The party is absent from the response, subunits included.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party expected to be absent.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyIsAbsent(parties, partyUuid, as = null) {
    return Assert(as ?? `CheckPartyIsAbsent - '${partyUuid}' is not in the party list`, parties,
        (body) => FindParty(body, partyUuid) === undefined,
        () => [`'${partyUuid}' was in the party list and should not have been`]);
}

/**
 * The party is not returned at the top level, since a subunit is only ever returned
 * nested under its main unit.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyIsNotTopLevel(parties, subunitPartyUuid, as = null) {
    return Assert(as ?? `CheckPartyIsNotTopLevel - '${subunitPartyUuid}' is not returned at the top level`, parties,
        (body) => !TopLevelPartyUuids(body).includes(Normalise(subunitPartyUuid)),
        () => [
            `subunit '${subunitPartyUuid}' was returned at the top level`,
            `top level party uuids: ${JSON.stringify(TopLevelPartyUuids(parties))}`,
        ]);
}

/**
 * Exactly the expected parties are returned at the top level.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {Array<string>} expectedPartyUuids - The uuids of the only expected top level parties.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckOnlyTheseTopLevelParties(parties, expectedPartyUuids, as = null) {
    const expected = expectedPartyUuids.map(Normalise);

    return Assert(as ?? "CheckOnlyTheseTopLevelParties - only the expected parties are returned at the top level", parties,
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
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the main unit.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyIsOnlyHierarchyElement(parties, partyUuid, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyIsOnlyHierarchyElement - '${partyUuid}' is only a hierarchy element with no access of its own`, party,
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
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHoldsAccessItself(parties, partyUuid, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyHoldsAccessItself - '${partyUuid}' holds the access itself`, party,
        (found) => found !== undefined && found.onlyHierarchyElementWithNoAccess === false,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`'${partyUuid}' came back as a hierarchy carrier with no access of its own`]);
}

/**
 * The party is an organization carrying the expected organization number.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedOrganizationNumber - The organization number the party should carry.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyIsOrganizationWithNumber(parties, partyUuid, expectedOrganizationNumber, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyIsOrganizationWithNumber - '${partyUuid}' is an organization with number ${expectedOrganizationNumber}`, party,
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
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedType - The expected party type.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyType(parties, partyUuid, expectedType, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyType - '${partyUuid}' is of type ${expectedType}`, party,
        (found) => found !== undefined && found.type === expectedType,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`expected type '${expectedType}', got '${party.type}'`]);
}

/**
 * The party carries no national identity number, which is how a self identified or
 * email registered user comes back.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasNoNationalIdentityNumber(parties, partyUuid, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyHasNoNationalIdentityNumber - '${partyUuid}' carries no national identity number`, party,
        (found) => found !== undefined && found.personId === null,
        () => [`expected personId null on '${partyUuid}', got '${party?.personId}'`]);
}

/**
 * The party carries the expected email identifier.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedEmailId - The email identifier the party should carry.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasEmailId(parties, partyUuid, expectedEmailId, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyHasEmailId - '${partyUuid}' carries the email id ${expectedEmailId}`, party,
        (found) => found !== undefined && found.emailId === expectedEmailId,
        () => [`expected '${expectedEmailId}' on '${partyUuid}', got '${party?.emailId}'`]);
}

/**
 * The party's access packages include all of the expected ones.
 *
 * A subset assertion, since the catalogue wide sets these fixtures hold are not worth
 * pinning exactly.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {Array<string>} expectedAccessPackages - The access packages the party should hold.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyIncludesAccessPackages(parties, partyUuid, expectedAccessPackages, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyIncludesAccessPackages - '${partyUuid}' holds the expected access packages`, party,
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
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasSomeAccessPackages(parties, partyUuid, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyHasSomeAccessPackages - '${partyUuid}' holds at least one access package`, party,
        (found) => found !== undefined && (found.authorizedAccessPackages ?? []).length > 0,
        () => [`expected access packages on '${partyUuid}', got: ${JSON.stringify(party?.authorizedAccessPackages ?? [])}`]);
}

/**
 * The party's roles include the expected role, compared case insensitively.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedRole - The role the party should hold.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyIncludesRole(parties, partyUuid, expectedRole, as = null) {
    const party = FindParty(parties, partyUuid);
    const wanted = expectedRole.toLowerCase();

    return Assert(as ?? `CheckPartyIncludesRole - '${partyUuid}' holds the role ${expectedRole}`, party,
        (found) => found !== undefined &&
            (found.authorizedRoles ?? []).some((role) => String(role).toLowerCase() === wanted),
        () => [`expected role '${expectedRole}' on '${partyUuid}', got: ${JSON.stringify(party?.authorizedRoles ?? [])}`]);
}

/**
 * The party holds exactly the expected resources and nothing else.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {Array<string>} expectedResources - The only resources the party should hold.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasExactlyResources(parties, partyUuid, expectedResources, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyHasExactlyResources - '${partyUuid}' holds exactly the expected resources`, party,
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
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasSomeAccess(parties, partyUuid, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyHasSomeAccess - '${partyUuid}' holds some access`, party,
        (found) => found !== undefined && AllAccess(found).length > 0,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`expected some delegated access on '${partyUuid}'`]);
}

/**
 * The party has no subunits, which is how a person party comes back.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasNoSubunits(parties, partyUuid, as = null) {
    const party = FindParty(parties, partyUuid);

    return Assert(as ?? `CheckPartyHasNoSubunits - '${partyUuid}' has no subunits`, party,
        (found) => found !== undefined && (found.subunits ?? []).length === 0,
        () => [`'${partyUuid}' came back with subunits: ${JSON.stringify((party?.subunits ?? []).map((subunit) => subunit.partyUuid))}`]);
}

/**
 * The subunit is nested under the given main unit.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} mainUnitPartyUuid - The uuid of the main unit expected to hold the subunit.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckSubunitIsNestedUnderMainUnit(parties, mainUnitPartyUuid, subunitPartyUuid, as = null) {
    const mainUnit = FindParty(parties, mainUnitPartyUuid);
    const wanted = Normalise(subunitPartyUuid);

    return Assert(as ?? `CheckSubunitIsNestedUnderMainUnit - '${subunitPartyUuid}' is nested under '${mainUnitPartyUuid}'`, mainUnit,
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
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} mainUnitPartyUuid - The uuid of the main unit.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckSubunitInheritsMainUnitAccessPackages(parties, mainUnitPartyUuid, subunitPartyUuid, as = null) {
    const mainUnit = FindParty(parties, mainUnitPartyUuid);
    const subunit = FindParty(parties, subunitPartyUuid);

    return Assert(as ?? `CheckSubunitInheritsMainUnitAccessPackages - '${subunitPartyUuid}' inherits the access packages of '${mainUnitPartyUuid}'`, subunit,
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
 * At least one main unit in the response both holds instance access and has subunits.
 *
 * The precondition the inheritance rule needs to mean anything. Asserted rather than
 * assumed, because a subject whose response has no such party makes the rule below pass
 * without testing it, which is how this went green while checking nothing.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckSomeMainUnitHoldsInstancesAndHasSubunits(parties, as = null) {
    const qualifying = (parties ?? []).filter((party) =>
        (party.authorizedInstances ?? []).length > 0 && (party.subunits ?? []).length > 0);

    return Assert(as ?? "CheckSomeMainUnitHoldsInstancesAndHasSubunits - a main unit both holds instances and has subunits", parties,
        () => qualifying.length > 0,
        () => ["no main unit in the response both holds instances and has subunits, so there is nothing for the inheritance rule to be tested against: the fixture or the subject needs revisiting"]);
}

/**
 * No subunit carries an instance its main unit holds.
 *
 * Access packages and resources extend from a main unit to its subunits, but instance
 * access does not: an instance is delegated to one party and stays there.
 *
 * That there is anything to inspect at all is asserted separately, by
 * CheckSomeMainUnitHoldsInstancesAndHasSubunits, so this stays a statement of the rule.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckNoSubunitInheritsInstances(parties, as = null) {
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

    // The precondition check above is the primary guard. This keeps the same protection
    // for any caller that asserts the rule without it.
    return Assert(as ?? "CheckNoSubunitInheritsInstances - no subunit inherits instances from its main unit", parties,
        () => problems.length === 0 && inspected > 0,
        () => inspected === 0
            ? ["no main unit in the response both holds instances and has subunits, so the rule was never exercised: the fixture or the subject needs revisiting"]
            : problems);
}

/**
 * Every party has all four access collections empty, which is what the include flags
 * being off should produce.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckEveryPartyHasNoAccessInformation(parties, as = null) {
    const problems = FlattenParties(parties)
        .filter((party) => AllAccess(party).length > 0)
        .map((party) => `${party.partyUuid} carries ${JSON.stringify(AllAccess(party))}`);

    return Assert(as ?? "CheckEveryPartyHasNoAccessInformation - no party carries access information", parties, () => problems.length === 0, () => problems);
}

/**
 * No party in the response carries the given resource.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} resourceId - The resource that should not appear anywhere.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckNoPartyCarriesResource(parties, resourceId, as = null) {
    const offenders = FlattenParties(parties)
        .filter((party) => (party.authorizedResources ?? []).includes(resourceId))
        .map((party) => party.partyUuid);

    return Assert(as ?? `CheckNoPartyCarriesResource - no party carries '${resourceId}'`, parties,
        () => offenders.length === 0,
        () => [`'${resourceId}' unexpectedly appeared on: ${JSON.stringify(offenders)}`]);
}

/**
 * No party is returned more than once, subunits included.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckNoDuplicateParties(parties, as = null) {
    const partyUuids = PartyUuidList(parties);
    const duplicates = partyUuids.filter((partyUuid, index) => partyUuids.indexOf(partyUuid) !== index);

    return Assert(as ?? "CheckNoDuplicateParties - no party is returned more than once", parties,
        () => duplicates.length === 0,
        () => [`duplicate party uuids: ${JSON.stringify([...new Set(duplicates)])}`]);
}

/**
 * The party list matches a baseline recorded by an earlier step.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {Array<string>} baselinePartyUuids - The sorted uuid list to compare against.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckPartyUuidsMatchBaseline(parties, baselinePartyUuids, as = null) {
    return Assert(as ?? "CheckPartyUuidsMatchBaseline - the party list matches the baseline", parties,
        (body) => SameMembers(PartyUuidList(body), baselinePartyUuids),
        () => [
            `baseline: ${JSON.stringify(baselinePartyUuids)}`,
            `got: ${JSON.stringify(PartyUuidList(parties))}`,
        ]);
}

/**
 * The request succeeded, for the steps that only care about the status.
 *
 * @param {object} response - The raw HTTP response.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckRequestSucceeded(response, as = null) {
    return Assert(as ?? "CheckRequestSucceeded - the request succeeded", response,
        (res) => res.status === 200,
        () => [`expected 200, got ${response.status}`, `body: ${response.body}`]);
}

/**
 * The request was rejected with the expected status.
 *
 * The building block asserts 200 and returns an empty list on anything else, so the
 * steps that mean to be rejected call the client directly and land here.
 *
 * @param {object} response - The raw HTTP response.
 * @param {number} expectedStatus - The status the request should have been rejected with.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckRequestRejected(response, expectedStatus, as = null) {
    return Assert(as ?? `CheckRequestRejected - the request was rejected with ${expectedStatus}`, response,
        (res) => res.status === expectedStatus,
        () => [`expected ${expectedStatus}, got ${response.status}`, `body: ${response.body}`]);
}

/**
 * The request was rejected as unauthenticated.
 *
 * @param {object} response - The raw HTTP response.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckUnauthorized(response, as = null) {
    return CheckRequestRejected(response, 401, as ?? "CheckUnauthorized - the request was rejected as unauthenticated");
}

/**
 * The request was rejected as unauthorized.
 *
 * @param {object} response - The raw HTTP response.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckForbidden(response, as = null) {
    return CheckRequestRejected(response, 403, as ?? "CheckForbidden - the request was rejected as unauthorized");
}

/**
 * The request was rejected as a bad request.
 *
 * @param {object} response - The raw HTTP response.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckBadRequest(response, as = null) {
    return CheckRequestRejected(response, 400, as ?? "CheckBadRequest - the request was rejected as a bad request");
}

/**
 * The problem body names the value that was refused.
 *
 * @param {object} response - The raw HTTP response.
 * @param {string} expectedInBody - A value the problem body is expected to mention.
 * @param {string} [as] - Overrides the check name.
 * @returns {boolean} True if the check held.
 */
function CheckProblemBodyMentions(response, expectedInBody, as = null) {
    return Assert(as ?? `CheckProblemBodyMentions - the problem body mentions '${expectedInBody}'`, response,
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
    CheckSomeMainUnitHoldsInstancesAndHasSubunits,
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
