import { check } from "k6";

import { AuthorizedPartyDto } from "../../../../clients/access-management/enduser/authorized-parties/authorized-parties.types.js";

/**
 * Flattens a party hierarchy into a single list, parents before their subunits.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The parties to flatten.
 * @returns {AuthorizedPartyDto[]} Every party in the hierarchy.
 */
function FlattenParties(parties) {
    return (parties ?? []).flatMap((party) => [party, ...FlattenParties(party.subunits)]);
}

/**
 * Finds a party anywhere in the hierarchy by its UUID.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The parties to search.
 * @param {string} partyUuid - The UUID of the party to find.
 * @returns {AuthorizedPartyDto|undefined} The party, or undefined if it is not present.
 */
function FindParty(parties, partyUuid) {
    return FlattenParties(parties).find((party) => party.partyUuid === partyUuid);
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
 * Reduces a resource instance to the identifying pair the tests care about.
 *
 * @param {{resourceId: string|null, instanceRef: string|null}} instance - The instance to describe.
 * @returns {string} A comparable description of the instance.
 */
function InstanceKey(instance) {
    return `${instance.resourceId} ${instance.instanceRef}`;
}

/**
 * Checks that the expected party is returned as a top level party.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The authorized parties returned by the API.
 * @param {string} expectedPartyUuid - The UUID of the party that is expected to be present.
 * @returns {boolean} True if the party is present, false otherwise.
 */
function CheckPartyIsPresent(parties, expectedPartyUuid) {
    const success = check(parties, {
        "CheckPartyIsPresent - Expected party is returned as a top level party": (returnedParties) => {
            return (returnedParties ?? []).some((party) => party.partyUuid === expectedPartyUuid);
        },
    });

    if (!success) {
        console.error(`CheckPartyIsPresent - expected partyUuid '${expectedPartyUuid}' was not found among the top level parties`);
        console.error(`CheckPartyIsPresent - top level partyUuids returned: ${JSON.stringify((parties ?? []).map((party) => party.partyUuid))}`);
    }

    return success;
}

/**
 * Checks that the expected sub party is returned as a subunit of the given parent party.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The authorized parties returned by the API.
 * @param {string} parentPartyUuid - The UUID of the party expected to hold the subunit.
 * @param {string} expectedSubPartyUuid - The UUID of the subunit that is expected to be present.
 * @returns {boolean} True if the subunit is present under the parent party, false otherwise.
 */
function CheckSubPartyIsPresent(parties, parentPartyUuid, expectedSubPartyUuid) {
    const parent = FindParty(parties, parentPartyUuid);

    const success = check(parent, {
        "CheckSubPartyIsPresent - Expected sub party is returned under its parent party": (parentParty) => {
            return (parentParty?.subunits ?? []).some((subunit) => subunit.partyUuid === expectedSubPartyUuid);
        },
    });

    if (!success) {
        if (parent === undefined) {
            console.error(`CheckSubPartyIsPresent - parent partyUuid '${parentPartyUuid}' was not found in the response`);
        } else {
            console.error(`CheckSubPartyIsPresent - expected subunit '${expectedSubPartyUuid}' under parent '${parentPartyUuid}'`);
            console.error(`CheckSubPartyIsPresent - subunit partyUuids returned: ${JSON.stringify((parent.subunits ?? []).map((subunit) => subunit.partyUuid))}`);
        }
    }

    return success;
}

/**
 * Checks that the given party is returned without any access, meaning it holds no
 * access packages, resources, roles or instances.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The UUID of the party that is expected to have no access.
 * @returns {boolean} True if the party is present and has no access, false otherwise.
 */
function CheckPartyHasNoAccess(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasNoAccess - Party is returned without any access": (returnedParty) => {
            return returnedParty !== undefined &&
                (returnedParty.authorizedAccessPackages ?? []).length === 0 &&
                (returnedParty.authorizedResources ?? []).length === 0 &&
                (returnedParty.authorizedRoles ?? []).length === 0 &&
                (returnedParty.authorizedInstances ?? []).length === 0;
        },
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyHasNoAccess - partyUuid '${partyUuid}' was not found in the response`);
        } else {
            console.error(`CheckPartyHasNoAccess - expected partyUuid '${partyUuid}' to hold no access, got: ${JSON.stringify({
                authorizedAccessPackages: party.authorizedAccessPackages,
                authorizedResources: party.authorizedResources,
                authorizedRoles: party.authorizedRoles,
                authorizedInstances: party.authorizedInstances,
            })}`);
        }
    }

    return success;
}

/**
 * Checks that the given party holds exactly the expected access packages.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The UUID of the party to inspect.
 * @param {Array<string>} expectedAccessPackages - The access packages the party is expected to hold.
 * @returns {boolean} True if the party is present and holds exactly those access packages, false otherwise.
 */
function CheckPartyHasAccessPackages(parties, partyUuid, expectedAccessPackages) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasAccessPackages - Party holds exactly the expected access packages": (returnedParty) => {
            return returnedParty !== undefined &&
                SameMembers(returnedParty.authorizedAccessPackages ?? [], expectedAccessPackages);
        },
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyHasAccessPackages - partyUuid '${partyUuid}' was not found in the response`);
        } else {
            console.error(`CheckPartyHasAccessPackages - expected partyUuid '${partyUuid}' to hold: ${JSON.stringify(expectedAccessPackages)}`);
            console.error(`CheckPartyHasAccessPackages - got: ${JSON.stringify(party.authorizedAccessPackages ?? [])}`);
        }
    }

    return success;
}

/**
 * Checks that the given party holds exactly the expected resources.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The UUID of the party to inspect.
 * @param {Array<string>} expectedResources - The resources the party is expected to hold.
 * @returns {boolean} True if the party is present and holds exactly those resources, false otherwise.
 */
function CheckPartyHasResources(parties, partyUuid, expectedResources) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasResources - Party holds exactly the expected resources": (returnedParty) => {
            return returnedParty !== undefined &&
                SameMembers(returnedParty.authorizedResources ?? [], expectedResources);
        },
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyHasResources - partyUuid '${partyUuid}' was not found in the response`);
        } else {
            console.error(`CheckPartyHasResources - expected partyUuid '${partyUuid}' to hold: ${JSON.stringify(expectedResources)}`);
            console.error(`CheckPartyHasResources - got: ${JSON.stringify(party.authorizedResources ?? [])}`);
        }
    }

    return success;
}

/**
 * Checks that the given party holds exactly the expected roles.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The UUID of the party to inspect.
 * @param {Array<string>} expectedRoles - The roles the party is expected to hold.
 * @returns {boolean} True if the party is present and holds exactly those roles, false otherwise.
 */
function CheckPartyHasRoles(parties, partyUuid, expectedRoles) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasRoles - Party holds exactly the expected roles": (returnedParty) => {
            return returnedParty !== undefined &&
                SameMembers(returnedParty.authorizedRoles ?? [], expectedRoles);
        },
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyHasRoles - partyUuid '${partyUuid}' was not found in the response`);
        } else {
            console.error(`CheckPartyHasRoles - expected partyUuid '${partyUuid}' to hold: ${JSON.stringify(expectedRoles)}`);
            console.error(`CheckPartyHasRoles - got: ${JSON.stringify(party.authorizedRoles ?? [])}`);
        }
    }

    return success;
}

/**
 * Checks that the given party holds exactly the expected resource instances.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The UUID of the party to inspect.
 * @param {Array<{resourceId: string, instanceRef: string}>} expectedInstances - The instances the party is expected to hold.
 * @returns {boolean} True if the party is present and holds exactly those instances, false otherwise.
 */
function CheckPartyHasInstances(parties, partyUuid, expectedInstances) {
    const party = FindParty(parties, partyUuid);
    const expectedKeys = expectedInstances.map(InstanceKey);

    const success = check(party, {
        "CheckPartyHasInstances - Party holds exactly the expected resource instances": (returnedParty) => {
            return returnedParty !== undefined &&
                SameMembers((returnedParty.authorizedInstances ?? []).map(InstanceKey), expectedKeys);
        },
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyHasInstances - partyUuid '${partyUuid}' was not found in the response`);
        } else {
            console.error(`CheckPartyHasInstances - expected partyUuid '${partyUuid}' to hold: ${JSON.stringify(expectedKeys)}`);
            console.error(`CheckPartyHasInstances - got: ${JSON.stringify((party.authorizedInstances ?? []).map(InstanceKey))}`);
        }
    }

    return success;
}

/**
 * Checks that the given party is returned without any subunits.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The authorized parties returned by the API.
 * @param {string} partyUuid - The UUID of the party that is expected to have no subunits.
 * @returns {boolean} True if the party is present and holds no subunits, false otherwise.
 */
function CheckPartyHasNoSubParties(parties, partyUuid) {
    const party = FindParty(parties, partyUuid);

    const success = check(party, {
        "CheckPartyHasNoSubParties - Party is returned without any subunits": (returnedParty) => {
            return returnedParty !== undefined && (returnedParty.subunits ?? []).length === 0;
        },
    });

    if (!success) {
        if (party === undefined) {
            console.error(`CheckPartyHasNoSubParties - partyUuid '${partyUuid}' was not found in the response`);
        } else {
            console.error(`CheckPartyHasNoSubParties - expected partyUuid '${partyUuid}' to hold no subunits, got: ${JSON.stringify((party.subunits ?? []).map((subunit) => subunit.partyUuid))}`);
        }
    }

    return success;
}

/**
 * Checks that the response holds exactly the expected top level parties and nothing else.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The authorized parties returned by the API.
 * @param {Array<string>} expectedPartyUuids - The UUIDs of the only parties expected at the top level.
 * @returns {boolean} True if exactly those parties are returned, false otherwise.
 */
function CheckOnlyExpectedPartiesArePresent(parties, expectedPartyUuids) {
    const returnedPartyUuids = (parties ?? []).map((party) => party.partyUuid);

    const success = check(parties, {
        "CheckOnlyExpectedPartiesArePresent - Only the expected parties are returned at the top level": () => {
            return SameMembers(returnedPartyUuids, expectedPartyUuids);
        },
    });

    if (!success) {
        console.error(`CheckOnlyExpectedPartiesArePresent - expected: ${JSON.stringify(expectedPartyUuids)}`);
        console.error(`CheckOnlyExpectedPartiesArePresent - got: ${JSON.stringify(returnedPartyUuids)}`);
    }

    return success;
}

/**
 * Checks that no party is returned more than once, subunits included.
 *
 * @param {AuthorizedPartyDto[]|null} parties - The authorized parties returned by the API.
 * @returns {boolean} True if every party is returned exactly once, false otherwise.
 */
function CheckNoDuplicateParties(parties) {
    const partyUuids = FlattenParties(parties).map((party) => party.partyUuid);
    const duplicates = partyUuids.filter((partyUuid, index) => partyUuids.indexOf(partyUuid) !== index);

    const success = check(parties, {
        "CheckNoDuplicateParties - Every party is returned exactly once": () => duplicates.length === 0,
    });

    if (!success) {
        console.error(`CheckNoDuplicateParties - duplicate partyUuids: ${JSON.stringify([...new Set(duplicates)])}`);
    }

    return success;
}

export const AuthorizedPartiesDomainChecks = {
    CheckPartyIsPresent,
    CheckSubPartyIsPresent,
    CheckPartyHasNoAccess,
    CheckPartyHasAccessPackages,
    CheckPartyHasResources,
    CheckPartyHasRoles,
    CheckPartyHasInstances,
    CheckPartyHasNoSubParties,
    CheckOnlyExpectedPartiesArePresent,
    CheckNoDuplicateParties,
};
