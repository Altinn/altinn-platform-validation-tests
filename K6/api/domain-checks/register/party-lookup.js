import { check } from "k6";

import { Party } from "../../../clients/register/types.js";

/**
 * Checks that a lookup found exactly one party.
 *
 * A lookup that found none or several says nothing about the party that follows,
 * so a caller that gets false back should fail() rather than assert on whatever
 * happened to be first.
 *
 * @param {Array<Party>|null} parties - What the lookup returned.
 * @param {string} lookedUpBy - What the lookup was keyed on, for the failure text.
 * @returns {boolean} True if there is exactly one party, false otherwise.
 */
function CheckSinglePartyFound(parties, lookedUpBy) {
    const success = check(parties, {
        "CheckSinglePartyFound - Lookup found exactly one party": (p) =>
            Array.isArray(p) && p.length === 1,
    });

    if (!success) {
        console.error(
            `CheckSinglePartyFound - looking up ${lookedUpBy} returned ${Array.isArray(parties) ? `${parties.length} parties` : JSON.stringify(parties)
            }`,
        );
    }

    return success;
}

/**
 * Checks that the party found by username is the self-identified user it should be.
 *
 * Both the party display name and the user record carry the username, and the
 * lookup is case insensitive, so an uppercased query has to come back with the
 * original casing.
 *
 * @param {Party|null} party - The party the lookup returned.
 * @param {string} expectedUsername - The username from the test data.
 * @returns {boolean} True if the party matches, false otherwise.
 */
function CheckPartyMatchesUsername(party, expectedUsername) {
    const success = check(party, {
        "CheckPartyMatchesUsername - Party is a self-identified user": (p) =>
            p?.partyType === "self-identified-user",
        "CheckPartyMatchesUsername - Display name and user name are the username": (p) =>
            p?.displayName === expectedUsername &&
            p?.user?.username === expectedUsername,
    });

    if (!success) {
        console.error(
            `CheckPartyMatchesUsername - expected '${expectedUsername}', got partyType '${party?.partyType}', displayName '${party?.displayName}', user.username '${party?.user?.username}'`,
        );
        console.error(`CheckPartyMatchesUsername - party returned: ${JSON.stringify(party)}`);
    }

    return success;
}

/**
 * Checks that the party found by ID-porten email is the self-identified user it
 * should be, and that it is not a deleted one.
 *
 * The username is deliberately not asserted. It comes from the A2 profile, so an
 * email user created in A3 has none, and look-up-on-username.js covers usernames
 * against a legacy self-identified user anyway.
 *
 * @param {Party|null} party - The party the lookup returned.
 * @param {string} expectedEmail - The email the lookup was keyed on.
 * @returns {boolean} True if the party matches, false otherwise.
 */
function CheckPartyMatchesIdportenEmail(party, expectedEmail) {
    const success = check(party, {
        "CheckPartyMatchesIdportenEmail - Party is a self-identified user": (p) =>
            p?.partyType === "self-identified-user",
        "CheckPartyMatchesIdportenEmail - Email, display name and urn are the email": (p) =>
            p?.email === expectedEmail &&
            p?.displayName === expectedEmail &&
            p?.externalUrn === `urn:altinn:person:idporten-email:${expectedEmail}`,
        "CheckPartyMatchesIdportenEmail - Party is not deleted": (p) =>
            p?.isDeleted === false && p?.deletedAt === null,
    });

    if (!success) {
        console.error(
            `CheckPartyMatchesIdportenEmail - expected '${expectedEmail}', got email '${party?.email}', displayName '${party?.displayName}', externalUrn '${party?.externalUrn}', isDeleted '${party?.isDeleted}', deletedAt '${party?.deletedAt}'`,
        );
        console.error(
            `CheckPartyMatchesIdportenEmail - party returned: ${JSON.stringify(party)}`,
        );
    }

    return success;
}

export const PartyLookupDomainChecks = {
    CheckSinglePartyFound,
    CheckPartyMatchesUsername,
    CheckPartyMatchesIdportenEmail,
};
