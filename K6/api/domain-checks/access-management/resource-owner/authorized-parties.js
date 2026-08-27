import { check } from "k6";

import { AuthorizedParty, ProblemDetails } from "../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties.types.js";

/**
 * Every check here names itself, after the function and the outcome it asserts, so it can
 * be called like any other domain check and needs nothing from the caller but the data.
 *
 * The names are fixed rather than built from the arguments, so a check called for several
 * parties in one group is reported as one check with several observations instead of one
 * line per party. The party uuids and expected values live in the failure diagnostics,
 * which is where they are needed.
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
 * @param {AuthorizedParty[]|null} parties - The parties to flatten.
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
 * @param {string} name - The check name.
 * @param {*} target - The value the assertion reads.
 * @param {(value: any) => boolean} assertion - Returns true when the check held.
 * @param {() => string[]} diagnose - Returns lines to log when it did not.
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
 * @returns {boolean} True if the check held.
 */
function CheckResponseIsPartyArray(parties) {
    return Assert("CheckResponseIsPartyArray - the response is an array of parties", parties,
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
 * @returns {boolean} True if the check held.
 */
function CheckResponseIsNonEmptyPartyArray(parties) {
    return Assert("CheckResponseIsNonEmptyPartyArray - the response is a non empty array of parties", parties,
        (body) => Array.isArray(body) && body.length > 0,
        () => [`expected a non empty array, got: ${JSON.stringify(parties)}`]);
}

/**
 * The response is an empty party array.
 *
 * @param {AuthorizedParty[]} parties - The response body.
 * @returns {boolean} True if the check held.
 */
function CheckResponseIsEmptyPartyArray(parties) {
    return Assert("CheckResponseIsEmptyPartyArray - the response is an empty array of parties", parties,
        (body) => Array.isArray(body) && body.length === 0,
        () => [`expected an empty array, got: ${JSON.stringify(TopLevelPartyUuids(parties))}`]);
}

/**
 * Every party carries exactly the contract's fields, each with the expected type.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @returns {boolean} True if the check held.
 */
function CheckEveryPartyMatchesContract(parties) {
    /** @type {string[]} */
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

        const byName = /** @type {{[key: string]: unknown}} */ (/** @type {unknown} */ (party));

        for (const collection of ["authorizedAccessPackages", "authorizedResources", "authorizedRoles", "authorizedInstances", "subunits"]) {
            if (!Array.isArray(byName[collection])) {
                problems.push(`${party.partyUuid} ${collection} is not an array`);
            }
        }
    }

    return Assert("CheckEveryPartyMatchesContract - every party matches the contract", parties, () => problems.length === 0, () => problems);
}

/**
 * The party is present anywhere in the response, subunits included.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party expected to be present.
 * @returns {boolean} True if the check held.
 */
function CheckPartyIsPresent(parties, partyUuid) {
    return Assert("CheckPartyIsPresent - the party is in the party list", parties,
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
 * @returns {boolean} True if the check held.
 */
function CheckPartyIsAbsent(parties, partyUuid) {
    return Assert("CheckPartyIsAbsent - the party is not in the party list", parties,
        (body) => FindParty(body, partyUuid) === undefined,
        () => [`'${partyUuid}' was in the party list and should not have been`]);
}

/**
 * The party is not returned at the top level, since a subunit is only ever returned
 * nested under its main unit.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @returns {boolean} True if the check held.
 */
function CheckPartyIsNotTopLevel(parties, subunitPartyUuid) {
    return Assert("CheckPartyIsNotTopLevel - the subunit is not returned at the top level", parties,
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
 * @returns {boolean} True if the check held.
 */
function CheckOnlyTheseTopLevelParties(parties, expectedPartyUuids) {
    const expected = expectedPartyUuids.map(Normalise);

    return Assert("CheckOnlyTheseTopLevelParties - only the expected parties are returned at the top level", parties,
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
 * @returns {boolean} True if the check held.
 */
function CheckPartyIsOnlyHierarchyElement(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert("CheckPartyIsOnlyHierarchyElement - the party is only a hierarchy element with no access of its own", party,
        (found) => found !== undefined &&
            found.onlyHierarchyElementWithNoAccess === true &&
            AllAccess(found).length === 0,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`'${partyUuid}' came back with onlyHierarchyElementWithNoAccess=${party.onlyHierarchyElementWithNoAccess}, access: ${JSON.stringify(AllAccess(party))}`]);
}

/**
 * The party holds the access itself rather than being a hierarchy carrier.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHoldsAccessItself(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert("CheckPartyHoldsAccessItself - the party holds the access itself", party,
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
 * @returns {boolean} True if the check held.
 */
function CheckPartyIsOrganizationWithNumber(parties, partyUuid, expectedOrganizationNumber) {
    const party = FindParty(parties, partyUuid);

    return Assert("CheckPartyIsOrganizationWithNumber - the party is an organization with the expected number", party,
        (found) => found !== undefined &&
            found.type === "Organization" &&
            found.organizationNumber === expectedOrganizationNumber,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`expected Organization/${expectedOrganizationNumber} on '${partyUuid}', got ${party.type}/${party.organizationNumber}`]);
}

/**
 * The party has the expected party type.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedType - The expected party type.
 * @returns {boolean} True if the check held.
 */
function CheckPartyType(parties, partyUuid, expectedType) {
    const party = FindParty(parties, partyUuid);

    return Assert("CheckPartyType - the party is of the expected type", party,
        (found) => found !== undefined && found.type === expectedType,
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [`expected type '${expectedType}' on '${partyUuid}', got '${party.type}'`]);
}

/**
 * The party carries no national identity number, which is how a self identified or
 * email registered user comes back.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasNoNationalIdentityNumber(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert("CheckPartyHasNoNationalIdentityNumber - the party carries no national identity number", party,
        (found) => found !== undefined && found.personId === null,
        () => [`expected personId null on '${partyUuid}', got '${party?.personId}'`]);
}

/**
 * The party carries the expected email identifier.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedEmailId - The email identifier the party should carry.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasEmailId(parties, partyUuid, expectedEmailId) {
    const party = FindParty(parties, partyUuid);

    return Assert("CheckPartyHasEmailId - the party carries the expected email id", party,
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
 * @returns {boolean} True if the check held.
 */
function CheckPartyIncludesAccessPackages(parties, partyUuid, expectedAccessPackages) {
    const party = FindParty(parties, partyUuid);

    return Assert(`CheckPartyIncludesAccessPackages - '${partyUuid}' holds the expected access packages`, party,
        (found) => found !== undefined &&
            expectedAccessPackages.every((wanted) => (found.authorizedAccessPackages ?? []).includes(wanted)),
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [
                `expected '${partyUuid}' to hold: ${JSON.stringify(expectedAccessPackages)}`,
                `got: ${JSON.stringify(party.authorizedAccessPackages ?? [])}`,
            ]);
}

/**
 * The party holds at least one access package.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasSomeAccessPackages(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert("CheckPartyHasSomeAccessPackages - the party holds at least one access package", party,
        (found) => found !== undefined && (found.authorizedAccessPackages ?? []).length > 0,
        () => [`expected access packages on '${partyUuid}', got: ${JSON.stringify(party?.authorizedAccessPackages ?? [])}`]);
}

/**
 * The party's roles include the expected role, compared case insensitively.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedRole - The role the party should hold.
 * @returns {boolean} True if the check held.
 */
function CheckPartyIncludesRole(parties, partyUuid, expectedRole) {
    const party = FindParty(parties, partyUuid);
    const wanted = expectedRole.toLowerCase();

    return Assert("CheckPartyIncludesRole - the party holds the expected role", party,
        (found) => found !== undefined &&
            (found.authorizedRoles ?? []).some((/** @type {*} */ role) => String(role).toLowerCase() === wanted),
        () => [`expected role '${expectedRole}' on '${partyUuid}', got: ${JSON.stringify(party?.authorizedRoles ?? [])}`]);
}

/**
 * The party holds exactly the expected resources and nothing else.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {Array<string>} expectedResources - The only resources the party should hold.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasExactlyResources(parties, partyUuid, expectedResources) {
    const party = FindParty(parties, partyUuid);

    return Assert("CheckPartyHasExactlyResources - the party holds exactly the expected resources", party,
        (found) => found !== undefined && SameMembers(found.authorizedResources ?? [], expectedResources),
        () => party === undefined
            ? [`'${partyUuid}' was not in the party list`]
            : [
                `expected '${partyUuid}' to hold exactly: ${JSON.stringify(expectedResources)}`,
                `got: ${JSON.stringify(party.authorizedResources ?? [])}`,
            ]);
}

/**
 * The party holds some access, across any of the four collections.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasSomeAccess(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert("CheckPartyHasSomeAccess - the party holds some access", party,
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
 * @returns {boolean} True if the check held.
 */
function CheckPartyHasNoSubunits(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    return Assert("CheckPartyHasNoSubunits - the party has no subunits", party,
        (found) => found !== undefined && (found.subunits ?? []).length === 0,
        () => [`'${partyUuid}' came back with subunits: ${JSON.stringify((party?.subunits ?? []).map((subunit) => subunit.partyUuid))}`]);
}

/**
 * The subunit is nested under the given main unit.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} mainUnitPartyUuid - The uuid of the main unit expected to hold the subunit.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @returns {boolean} True if the check held.
 */
function CheckSubunitIsNestedUnderMainUnit(parties, mainUnitPartyUuid, subunitPartyUuid) {
    const mainUnit = FindParty(parties, mainUnitPartyUuid);
    const wanted = Normalise(subunitPartyUuid);

    return Assert("CheckSubunitIsNestedUnderMainUnit - the subunit is nested under the main unit", mainUnit,
        (found) => (found?.subunits ?? []).some((/** @type {*} */ subunit) => Normalise(subunit.partyUuid) === wanted),
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
 * @returns {boolean} True if the check held.
 */
function CheckSubunitInheritsMainUnitAccessPackages(parties, mainUnitPartyUuid, subunitPartyUuid) {
    const mainUnit = FindParty(parties, mainUnitPartyUuid);
    const subunit = FindParty(parties, subunitPartyUuid);

    return Assert("CheckSubunitInheritsMainUnitAccessPackages - the subunit inherits the access packages of its main unit", subunit,
        (found) => found !== undefined && mainUnit !== undefined &&
            (mainUnit.authorizedAccessPackages ?? [])
                .every((wanted) => (found.authorizedAccessPackages ?? []).includes(wanted)),
        () => mainUnit === undefined || subunit === undefined
            ? [`main unit '${mainUnitPartyUuid}' or subunit '${subunitPartyUuid}' was not in the party list`]
            : [
                `main unit '${mainUnitPartyUuid}' holds: ${JSON.stringify(mainUnit.authorizedAccessPackages ?? [])}`,
                `subunit '${subunitPartyUuid}' holds: ${JSON.stringify(subunit.authorizedAccessPackages ?? [])}`,
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
 * @returns {boolean} True if the check held.
 */
function CheckSomeMainUnitHoldsInstancesAndHasSubunits(parties) {
    const qualifying = (parties ?? []).filter((party) =>
        (party.authorizedInstances ?? []).length > 0 && (party.subunits ?? []).length > 0);

    return Assert("CheckSomeMainUnitHoldsInstancesAndHasSubunits - a main unit both holds instances and has subunits", parties,
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
 * @returns {boolean} True if the check held.
 */
function CheckNoSubunitInheritsInstances(parties) {
    /** @type {string[]} */
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
    return Assert("CheckNoSubunitInheritsInstances - no subunit inherits instances from its main unit", parties,
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
 * @returns {boolean} True if the check held.
 */
function CheckEveryPartyHasNoAccessInformation(parties) {
    const problems = FlattenParties(parties)
        .filter((party) => AllAccess(party).length > 0)
        .map((party) => `${party.partyUuid} carries ${JSON.stringify(AllAccess(party))}`);

    return Assert("CheckEveryPartyHasNoAccessInformation - no party carries access information", parties, () => problems.length === 0, () => problems);
}

/**
 * No party in the response carries the given resource.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} resourceId - The resource that should not appear anywhere.
 * @returns {boolean} True if the check held.
 */
function CheckNoPartyCarriesResource(parties, resourceId) {
    const offenders = FlattenParties(parties)
        .filter((party) => (party.authorizedResources ?? []).includes(resourceId))
        .map((party) => party.partyUuid);

    return Assert("CheckNoPartyCarriesResource - no party carries the resource", parties,
        () => offenders.length === 0,
        () => [`'${resourceId}' unexpectedly appeared on: ${JSON.stringify(offenders)}`]);
}

/**
 * No party is returned more than once, subunits included.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @returns {boolean} True if the check held.
 */
function CheckNoDuplicateParties(parties) {
    const partyUuids = PartyUuidList(parties);
    const duplicates = partyUuids.filter((partyUuid, index) => partyUuids.indexOf(partyUuid) !== index);

    return Assert("CheckNoDuplicateParties - no party is returned more than once", parties,
        () => duplicates.length === 0,
        () => [`duplicate party uuids: ${JSON.stringify([...new Set(duplicates)])}`]);
}

/**
 * The party list matches a baseline recorded by an earlier step.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {Array<string>} baselinePartyUuids - The sorted uuid list to compare against.
 * @returns {boolean} True if the check held.
 */
function CheckPartyUuidsMatchBaseline(parties, baselinePartyUuids) {
    return Assert("CheckPartyUuidsMatchBaseline - the party list matches the baseline", parties,
        (body) => SameMembers(PartyUuidList(body), baselinePartyUuids),
        () => [
            `baseline: ${JSON.stringify(baselinePartyUuids)}`,
            `got: ${JSON.stringify(PartyUuidList(parties))}`,
        ]);
}

/**
 * The problem body names the value that was refused.
 *
 * @param {ProblemDetails|null} problem - The problem body, as the building block parsed it.
 * @param {string} expectedInBody - A value the problem body is expected to mention.
 * @returns {boolean} True if the check held.
 */
function CheckProblemBodyMentions(problem, expectedInBody) {
    return Assert("CheckProblemBodyMentions - the problem body mentions the expected value", problem,
        (body) => JSON.stringify(body ?? "").includes(expectedInBody),
        () => [`expected '${expectedInBody}' in the problem body, got: ${JSON.stringify(problem)}`]);
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
    CheckProblemBodyMentions,
};
