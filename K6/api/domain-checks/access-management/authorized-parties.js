import { check } from "k6";

import { AuthorizedPartyDto } from "../../../clients/access-management/enduser/authorized-parties/authorized-parties.types.js";

/**
 * Flattens a party hierarchy into a single list, parents before their subunits.
 *
 * @param {AuthorizedPartyDto[]} parties - The parties to flatten.
 * @returns {AuthorizedPartyDto[]} Every party in the hierarchy.
 */
function FlattenParties(parties) {
    return (parties ?? []).flatMap((party) => [party, ...FlattenParties(party.subunits)]);
}

/**
 * Finds a party anywhere in the hierarchy by its UUID.
 *
 * @param {AuthorizedPartyDto[]} parties - The parties to search.
 * @param {string} partyUuid - The UUID of the party to find.
 * @returns {AuthorizedPartyDto|undefined} The party, or undefined if it is not present.
 */
function FindParty(parties, partyUuid) {
    return FlattenParties(parties).find((party) => party.partyUuid === partyUuid);
}

/**
 * Checks that the expected party is returned as a top level party.
 *
 * @param {AuthorizedPartyDto[]} parties - The authorized parties returned by the API.
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
 * @param {AuthorizedPartyDto[]} parties - The authorized parties returned by the API.
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
 * @param {AuthorizedPartyDto[]} parties - The authorized parties returned by the API.
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
 * Checks that no party is returned more than once, subunits included.
 *
 * @param {AuthorizedPartyDto[]} parties - The authorized parties returned by the API.
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
    CheckNoDuplicateParties,
};
