import { check } from "k6";

import { AuthorizedParty } from "../../../../clients/access-management/resource-owner/authorized-parties/authorized-parties.types.js";

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
 * Checks that the response is a non empty bare array of parties.
 *
 * The service owner endpoint returns the parties directly, not wrapped in the
 * paginated envelope the enduser endpoint uses, so this is part of its contract.
 *
 * @param {AuthorizedParty[]} parties - The response body.
 * @returns {boolean} True if the body is a non empty array.
 */
function CheckResponseIsNonEmptyPartyArray(parties) {
    const success = check(parties, {
        "CheckResponseIsNonEmptyPartyArray - The response is a non empty bare array of parties":
            (body) => Array.isArray(body) && body.length > 0,
    });

    if (!success) {
        console.error(`CheckResponseIsNonEmptyPartyArray - expected a non empty array, got: ${JSON.stringify(parties)}`);
    }

    return success;
}

/**
 * Checks that the response is an empty party array.
 *
 * @param {AuthorizedParty[]} parties - The response body.
 * @param {string} reason - Why the list is expected to be empty, for the failure message.
 * @returns {boolean} True if the body is an empty array.
 */
function CheckResponseIsEmptyPartyArray(parties, reason) {
    const success = check(parties, {
        "CheckResponseIsEmptyPartyArray - The response is an empty party array":
            (body) => Array.isArray(body) && body.length === 0,
    });

    if (!success) {
        console.error(`CheckResponseIsEmptyPartyArray - ${reason}, so the list should be empty, got: ${JSON.stringify(TopLevelPartyUuids(parties))}`);
    }

    return success;
}

/**
 * Checks that every party in the response carries exactly the contract's fields,
 * each with the expected type.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @returns {boolean} True if every party matches the contract.
 */
function CheckEveryPartyMatchesContract(parties) {
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

    const success = check(parties, {
        "CheckEveryPartyMatchesContract - Every party carries the contract's fields with the expected types":
            () => problems.length === 0,
    });

    if (!success) {
        problems.forEach((problem) => console.error(`CheckEveryPartyMatchesContract - ${problem}`));
    }

    return success;
}

/**
 * Checks that a party is present anywhere in the response, subunits included.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} expectedPartyUuid - The uuid of the party expected to be present.
 * @param {string} description - What the party is, for the failure message.
 * @returns {boolean} True if the party is present.
 */
function CheckPartyIsPresent(parties, expectedPartyUuid, description) {
    const success = check(parties, {
        "CheckPartyIsPresent - The expected party is in the party list":
            (body) => FindParty(body, expectedPartyUuid) !== undefined,
    });

    if (!success) {
        console.error(`CheckPartyIsPresent - expected ${description} ('${expectedPartyUuid}') in the party list`);
        console.error(`CheckPartyIsPresent - party uuids returned: ${JSON.stringify(PartyUuidList(parties))}`);
    }

    return success;
}

/**
 * Checks that a party is absent from the response, subunits included.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party expected to be absent.
 * @param {string} reason - Why the party should not be there, for the failure message.
 * @returns {boolean} True if the party is absent.
 */
function CheckPartyIsAbsent(parties, partyUuid, reason) {
    const success = check(parties, {
        "CheckPartyIsAbsent - The party is not in the party list":
            (body) => FindParty(body, partyUuid) === undefined,
    });

    if (!success) {
        console.error(`CheckPartyIsAbsent - '${partyUuid}' should not be in the party list: ${reason}`);
    }

    return success;
}

/**
 * Checks that a party is not returned at the top level, since a subunit is only
 * ever returned nested under its main unit.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @returns {boolean} True if the subunit is absent from the top level.
 */
function CheckPartyIsNotTopLevel(parties, subunitPartyUuid) {
    const success = check(parties, {
        "CheckPartyIsNotTopLevel - A subunit is never returned as a top level party":
            (body) => !TopLevelPartyUuids(body).includes(Normalise(subunitPartyUuid)),
    });

    if (!success) {
        console.error(`CheckPartyIsNotTopLevel - subunit '${subunitPartyUuid}' was returned at the top level`);
        console.error(`CheckPartyIsNotTopLevel - top level party uuids: ${JSON.stringify(TopLevelPartyUuids(parties))}`);
    }

    return success;
}

/**
 * Checks that exactly the expected parties are returned at the top level.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {Array<string>} expectedPartyUuids - The uuids of the only expected top level parties.
 * @returns {boolean} True if exactly those parties are returned.
 */
function CheckOnlyTheseTopLevelParties(parties, expectedPartyUuids) {
    const expected = expectedPartyUuids.map(Normalise);
    const returned = TopLevelPartyUuids(parties);

    const success = check(parties, {
        "CheckOnlyTheseTopLevelParties - Only the expected parties are returned at the top level":
            () => SameMembers(returned, expected),
    });

    if (!success) {
        console.error(`CheckOnlyTheseTopLevelParties - expected: ${JSON.stringify(expected)}`);
        console.error(`CheckOnlyTheseTopLevelParties - got: ${JSON.stringify(returned)}`);
    }

    return success;
}

/**
 * Checks that a party is returned only as a hierarchy carrier, holding no access
 * of its own, which is how a main unit shows up when the access sits on a subunit.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the main unit.
 * @returns {boolean} True if the party is present and carries no access.
 */
function CheckPartyIsOnlyHierarchyElement(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyIsOnlyHierarchyElement - The main unit is a hierarchy carrier with no access of its own":
            (found) => found !== undefined &&
                found.onlyHierarchyElementWithNoAccess === true &&
                AllAccess(found).length === 0,
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyIsOnlyHierarchyElement - '${partyUuid}' was not in the party list`);
        } else {
            console.error(`CheckPartyIsOnlyHierarchyElement - '${partyUuid}' onlyHierarchyElementWithNoAccess=${party.onlyHierarchyElementWithNoAccess}, access: ${JSON.stringify(AllAccess(party))}`);
        }
    }

    return success;
}

/**
 * Checks that a party holds the access itself rather than being a hierarchy carrier.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the party is present and holds access itself.
 */
function CheckPartyHoldsAccessItself(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHoldsAccessItself - The party holds the access itself, not merely as a hierarchy carrier":
            (found) => found !== undefined && found.onlyHierarchyElementWithNoAccess === false,
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyHoldsAccessItself - '${partyUuid}' was not in the party list`);
        } else {
            console.error(`CheckPartyHoldsAccessItself - '${partyUuid}' came back as a hierarchy carrier with no access of its own`);
        }
    }

    return success;
}

/**
 * Checks a party's organization number and party type.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedOrganizationNumber - The organization number the party should carry.
 * @returns {boolean} True if the party is an organization with that number.
 */
function CheckPartyIsOrganizationWithNumber(parties, partyUuid, expectedOrganizationNumber) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyIsOrganizationWithNumber - The party is an organization with the expected organization number":
            (found) => found !== undefined &&
                found.type === "Organization" &&
                found.organizationNumber === expectedOrganizationNumber,
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyIsOrganizationWithNumber - '${partyUuid}' was not in the party list`);
        } else {
            console.error(`CheckPartyIsOrganizationWithNumber - expected Organization/${expectedOrganizationNumber}, got ${party.type}/${party.organizationNumber}`);
        }
    }

    return success;
}

/**
 * Checks that a party has the expected party type.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedType - The expected party type.
 * @returns {boolean} True if the party carries that type.
 */
function CheckPartyType(parties, partyUuid, expectedType) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyType - The party has the expected party type":
            (found) => found !== undefined && found.type === expectedType,
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyType - '${partyUuid}' was not in the party list`);
        } else {
            console.error(`CheckPartyType - expected type '${expectedType}' on '${partyUuid}', got '${party.type}'`);
        }
    }

    return success;
}

/**
 * Checks that a party has no national identity number, which is how a self
 * identified or email registered user comes back.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @returns {boolean} True if the party's personId is null.
 */
function CheckPartyHasNoNationalIdentityNumber(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasNoNationalIdentityNumber - The party carries no national identity number":
            (found) => found !== undefined && found.personId === null,
    });

    if (!success) {
        console.error(`CheckPartyHasNoNationalIdentityNumber - expected personId null on '${partyUuid}', got '${party?.personId}'`);
    }

    return success;
}

/**
 * Checks that a party carries the expected email identifier.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedEmailId - The email identifier the party should carry.
 * @returns {boolean} True if the party carries that email identifier.
 */
function CheckPartyHasEmailId(parties, partyUuid, expectedEmailId) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasEmailId - The party carries the expected email identifier":
            (found) => found !== undefined && found.emailId === expectedEmailId,
    });

    if (!success) {
        console.error(`CheckPartyHasEmailId - expected '${expectedEmailId}' on '${partyUuid}', got '${party?.emailId}'`);
    }

    return success;
}

/**
 * Checks that a party's access packages include all of the expected ones.
 *
 * A subset assertion, since the catalogue wide sets these fixtures hold are not
 * worth pinning exactly.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {Array<string>} expectedAccessPackages - The access packages the party should hold.
 * @returns {boolean} True if the party holds all of them.
 */
function CheckPartyIncludesAccessPackages(parties, partyUuid, expectedAccessPackages) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyIncludesAccessPackages - The party holds the expected access packages":
            (found) => found !== undefined &&
                expectedAccessPackages.every((wanted) => (found.authorizedAccessPackages ?? []).includes(wanted)),
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyIncludesAccessPackages - '${partyUuid}' was not in the party list`);
        } else {
            console.error(`CheckPartyIncludesAccessPackages - expected '${partyUuid}' to hold: ${JSON.stringify(expectedAccessPackages)}`);
            console.error(`CheckPartyIncludesAccessPackages - got: ${JSON.stringify(party.authorizedAccessPackages ?? [])}`);
        }
    }

    return success;
}

/**
 * Checks that a party's access packages are not empty.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} reason - Why packages are expected, for the failure message.
 * @returns {boolean} True if the party holds at least one access package.
 */
function CheckPartyHasSomeAccessPackages(parties, partyUuid, reason) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasSomeAccessPackages - The party holds at least one access package":
            (found) => found !== undefined && (found.authorizedAccessPackages ?? []).length > 0,
    });

    if (!success) {
        console.error(`CheckPartyHasSomeAccessPackages - expected access packages on '${partyUuid}' (${reason}), got: ${JSON.stringify(party?.authorizedAccessPackages ?? [])}`);
    }

    return success;
}

/**
 * Checks that a party's roles include the expected role, compared case insensitively.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} expectedRole - The role the party should hold.
 * @returns {boolean} True if the party holds that role.
 */
function CheckPartyIncludesRole(parties, partyUuid, expectedRole) {
    const party = FindParty(parties, partyUuid);
    const wanted = expectedRole.toLowerCase();

    const success = check(party, {
        "CheckPartyIncludesRole - The party holds the expected role":
            (found) => found !== undefined &&
                (found.authorizedRoles ?? []).some((role) => String(role).toLowerCase() === wanted),
    });

    if (!success) {
        console.error(`CheckPartyIncludesRole - expected role '${expectedRole}' on '${partyUuid}', got: ${JSON.stringify(party?.authorizedRoles ?? [])}`);
    }

    return success;
}

/**
 * Checks that a party holds exactly the expected resources.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {Array<string>} expectedResources - The only resources the party should hold.
 * @returns {boolean} True if the party holds exactly those resources.
 */
function CheckPartyHasExactlyResources(parties, partyUuid, expectedResources) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasExactlyResources - The party holds exactly the expected resources":
            (found) => found !== undefined && SameMembers(found.authorizedResources ?? [], expectedResources),
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyHasExactlyResources - '${partyUuid}' was not in the party list`);
        } else {
            console.error(`CheckPartyHasExactlyResources - expected: ${JSON.stringify(expectedResources)}`);
            console.error(`CheckPartyHasExactlyResources - got: ${JSON.stringify(party.authorizedResources ?? [])}`);
        }
    }

    return success;
}

/**
 * Checks that a party holds some access, across any of the four collections.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} description - What the party is, for the failure message.
 * @returns {boolean} True if the party holds at least one access entry.
 */
function CheckPartyHasSomeAccess(parties, partyUuid, description) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasSomeAccess - The party carries the access that was delegated to it":
            (found) => found !== undefined && AllAccess(found).length > 0,
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyHasSomeAccess - ${description} ('${partyUuid}') was not in the party list`);
        } else {
            console.error(`CheckPartyHasSomeAccess - expected some delegated access on ${description} ('${partyUuid}')`);
        }
    }

    return success;
}

/**
 * Checks that a party has no subunits, which is how a person party comes back.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The uuid of the party.
 * @param {string} reason - Why no subunits are expected, for the failure message.
 * @returns {boolean} True if the party has no subunits.
 */
function CheckPartyHasNoSubunits(parties, partyUuid, reason) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasNoSubunits - The party is returned without subunits":
            (found) => found !== undefined && (found.subunits ?? []).length === 0,
    });

    if (!success) {
        console.error(`CheckPartyHasNoSubunits - ${reason}, but '${partyUuid}' came back with: ${JSON.stringify((party?.subunits ?? []).map((subunit) => subunit.partyUuid))}`);
    }

    return success;
}

/**
 * Checks that a subunit is nested under the given main unit.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} mainUnitPartyUuid - The uuid of the main unit expected to hold the subunit.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @param {string} description - What the subunit is, for the failure message.
 * @returns {boolean} True if the subunit is nested under that main unit.
 */
function CheckSubunitIsNestedUnderMainUnit(parties, mainUnitPartyUuid, subunitPartyUuid, description) {
    const mainUnit = FindParty(parties, mainUnitPartyUuid);
    const wanted = Normalise(subunitPartyUuid);

    const success = check(mainUnit, {
        "CheckSubunitIsNestedUnderMainUnit - The subunit is nested under its main unit":
            (found) => (found?.subunits ?? []).some((subunit) => Normalise(subunit.partyUuid) === wanted),
    });

    if (!success) {
        if (mainUnit === undefined) {
            console.error(`CheckSubunitIsNestedUnderMainUnit - main unit '${mainUnitPartyUuid}' was not in the party list`);
        } else {
            console.error(`CheckSubunitIsNestedUnderMainUnit - expected ${description} ('${subunitPartyUuid}') under '${mainUnitPartyUuid}'`);
            console.error(`CheckSubunitIsNestedUnderMainUnit - subunits returned: ${JSON.stringify((mainUnit.subunits ?? []).map((subunit) => subunit.partyUuid))}`);
        }
    }

    return success;
}

/**
 * Checks that a subunit's access packages include all of the expected ones.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @param {Array<string>} expectedAccessPackages - The access packages the subunit should hold.
 * @returns {boolean} True if the subunit holds all of them.
 */
function CheckSubunitIncludesAccessPackages(parties, subunitPartyUuid, expectedAccessPackages) {
    return CheckPartyIncludesAccessPackages(parties, subunitPartyUuid, expectedAccessPackages);
}

/**
 * Checks that a subunit inherits every access package its main unit holds.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} mainUnitPartyUuid - The uuid of the main unit.
 * @param {string} subunitPartyUuid - The uuid of the subunit.
 * @returns {boolean} True if the subunit holds at least the main unit's packages.
 */
function CheckSubunitInheritsMainUnitAccessPackages(parties, mainUnitPartyUuid, subunitPartyUuid) {
    const mainUnit = FindParty(parties, mainUnitPartyUuid);
    const subunit = FindParty(parties, subunitPartyUuid);

    const success = check(subunit, {
        "CheckSubunitInheritsMainUnitAccessPackages - The subunit inherits the access packages its main unit holds":
            (found) => found !== undefined && mainUnit !== undefined &&
                (mainUnit.authorizedAccessPackages ?? [])
                    .every((wanted) => (found.authorizedAccessPackages ?? []).includes(wanted)),
    });

    if (!success) {
        if (mainUnit === undefined || subunit === undefined) {
            console.error(`CheckSubunitInheritsMainUnitAccessPackages - main unit '${mainUnitPartyUuid}' or subunit '${subunitPartyUuid}' was not in the party list`);
        } else {
            console.error(`CheckSubunitInheritsMainUnitAccessPackages - main unit holds: ${JSON.stringify(mainUnit.authorizedAccessPackages ?? [])}`);
            console.error(`CheckSubunitInheritsMainUnitAccessPackages - subunit holds: ${JSON.stringify(subunit.authorizedAccessPackages ?? [])}`);
        }
    }

    return success;
}

/**
 * Checks that no subunit carries an instance its main unit holds.
 *
 * Access packages and resources extend from a main unit to its subunits, but
 * instance access does not: an instance is delegated to one party and stays there.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @returns {boolean} True if no subunit inherited an instance.
 */
function CheckNoSubunitInheritsInstances(parties) {
    const problems = [];

    for (const party of parties ?? []) {
        const mainUnitInstances = (party.authorizedInstances ?? []).map((instance) => instance.instanceId);

        if (mainUnitInstances.length === 0) {
            continue;
        }

        for (const subunit of party.subunits ?? []) {
            const subunitInstances = (subunit.authorizedInstances ?? []).map((instance) => instance.instanceId);
            const overlap = mainUnitInstances.filter((instance) => subunitInstances.includes(instance));

            if (overlap.length > 0) {
                problems.push(`subunit ${subunit.partyUuid} inherited instances from ${party.partyUuid}: ${overlap.join(", ")}`);
            }
        }
    }

    const success = check(parties, {
        "CheckNoSubunitInheritsInstances - Instance access is not inherited by subunits":
            () => problems.length === 0,
    });

    if (!success) {
        problems.forEach((problem) => console.error(`CheckNoSubunitInheritsInstances - ${problem}`));
    }

    return success;
}

/**
 * Checks that every party in the response has all four access collections empty,
 * which is what the include flags being off should produce.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @returns {boolean} True if no party carries any access information.
 */
function CheckEveryPartyHasNoAccessInformation(parties) {
    const problems = FlattenParties(parties)
        .filter((party) => AllAccess(party).length > 0)
        .map((party) => `${party.partyUuid} carries ${JSON.stringify(AllAccess(party))}`);

    const success = check(parties, {
        "CheckEveryPartyHasNoAccessInformation - No party carries access information when the flags are off":
            () => problems.length === 0,
    });

    if (!success) {
        problems.forEach((problem) => console.error(`CheckEveryPartyHasNoAccessInformation - ${problem}`));
    }

    return success;
}

/**
 * Checks that no party in the response carries the given resource.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {string} resourceId - The resource that should not appear anywhere.
 * @returns {boolean} True if no party carries the resource.
 */
function CheckNoPartyCarriesResource(parties, resourceId) {
    const offenders = FlattenParties(parties)
        .filter((party) => (party.authorizedResources ?? []).includes(resourceId))
        .map((party) => party.partyUuid);

    const success = check(parties, {
        "CheckNoPartyCarriesResource - No returned party carries the filtered resource":
            () => offenders.length === 0,
    });

    if (!success) {
        console.error(`CheckNoPartyCarriesResource - '${resourceId}' unexpectedly appeared on: ${JSON.stringify(offenders)}`);
    }

    return success;
}

/**
 * Checks that no party is returned more than once, subunits included.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @returns {boolean} True if every party is returned exactly once.
 */
function CheckNoDuplicateParties(parties) {
    const partyUuids = PartyUuidList(parties);
    const duplicates = partyUuids.filter((partyUuid, index) => partyUuids.indexOf(partyUuid) !== index);

    const success = check(parties, {
        "CheckNoDuplicateParties - Every party is returned exactly once":
            () => duplicates.length === 0,
    });

    if (!success) {
        console.error(`CheckNoDuplicateParties - duplicate party uuids: ${JSON.stringify([...new Set(duplicates)])}`);
    }

    return success;
}

/**
 * Checks that the party list matches a baseline recorded by an earlier step.
 *
 * @param {AuthorizedParty[]} parties - The authorized parties returned by the API.
 * @param {Array<string>} baselinePartyUuids - The sorted uuid list to compare against.
 * @param {string} lookupForm - The identifier form under test, for the failure message.
 * @returns {boolean} True if the party lists are identical.
 */
function CheckPartyUuidsMatchBaseline(parties, baselinePartyUuids, lookupForm) {
    const returned = PartyUuidList(parties);

    const success = check(parties, {
        "CheckPartyUuidsMatchBaseline - The identifier form resolves to the same party list as the baseline":
            () => SameMembers(returned, baselinePartyUuids),
    });

    if (!success) {
        console.error(`CheckPartyUuidsMatchBaseline - looking the subject up by ${lookupForm} gave a different party list`);
        console.error(`CheckPartyUuidsMatchBaseline - baseline: ${JSON.stringify(baselinePartyUuids)}`);
        console.error(`CheckPartyUuidsMatchBaseline - got: ${JSON.stringify(returned)}`);
    }

    return success;
}

/**
 * Checks that a request was rejected with the expected status.
 *
 * The building block asserts 200 and returns an empty list on anything else, so
 * the steps that mean to be rejected call the client directly and land here.
 *
 * @param {object} response - The raw HTTP response.
 * @param {number} expectedStatus - The status the request should have been rejected with.
 * @param {string} reason - What makes the request invalid, for the check name and failure message.
 * @returns {boolean} True if the response carried that status.
 */
function CheckRequestRejected(response, expectedStatus, reason) {
    const success = check(response, {
        [`CheckRequestRejected - ${reason} is rejected with ${expectedStatus}`]:
            (res) => res.status === expectedStatus,
    });

    if (!success) {
        console.error(`CheckRequestRejected - expected ${expectedStatus} because ${reason}, got ${response.status}`);
        console.error(`CheckRequestRejected - body: ${response.body}`);
    }

    return success;
}

/**
 * Checks that a request was rejected as unauthenticated.
 *
 * @param {object} response - The raw HTTP response.
 * @param {string} reason - What makes the request unauthenticated.
 * @returns {boolean} True if the response was a 401.
 */
function CheckUnauthorized(response, reason) {
    return CheckRequestRejected(response, 401, reason);
}

/**
 * Checks that a request was rejected as unauthorized.
 *
 * @param {object} response - The raw HTTP response.
 * @param {string} reason - What makes the request unauthorized.
 * @returns {boolean} True if the response was a 403.
 */
function CheckForbidden(response, reason) {
    return CheckRequestRejected(response, 403, reason);
}

/**
 * Checks that a request was rejected as a bad request, and that the problem body
 * names the value that was refused.
 *
 * @param {object} response - The raw HTTP response.
 * @param {string} reason - What makes the request invalid.
 * @param {string} expectedInBody - A value the problem body is expected to mention.
 * @returns {boolean} True if the response was a 400 naming that value.
 */
function CheckBadRequest(response, reason, expectedInBody) {
    const rejected = CheckRequestRejected(response, 400, reason);

    const named = check(response, {
        "CheckBadRequest - The problem body names the value that was refused":
            (res) => String(res.body ?? "").includes(expectedInBody),
    });

    if (!named) {
        console.error(`CheckBadRequest - expected '${expectedInBody}' in the problem body, got: ${response.body}`);
    }

    return rejected && named;
}

/**
 * Checks that the response is a party list, without saying anything about its contents.
 *
 * @param {AuthorizedParty[]} parties - The response body.
 * @returns {boolean} True if the body is an array.
 */
function CheckResponseIsPartyArray(parties) {
    const success = check(parties, {
        "CheckResponseIsPartyArray - The response is a bare array of parties":
            (body) => Array.isArray(body),
    });

    if (!success) {
        console.error(`CheckResponseIsPartyArray - expected an array, got: ${JSON.stringify(parties)}`);
    }

    return success;
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
    CheckSubunitIncludesAccessPackages,
    CheckSubunitInheritsMainUnitAccessPackages,
    CheckNoSubunitInheritsInstances,
    CheckEveryPartyHasNoAccessInformation,
    CheckNoPartyCarriesResource,
    CheckNoDuplicateParties,
    CheckPartyUuidsMatchBaseline,
    CheckUnauthorized,
    CheckForbidden,
    CheckBadRequest,
};
