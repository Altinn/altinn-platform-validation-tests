import { pickUnique } from "../../../../helpers.js";
import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { PersonalTokenBuilder } from "../../../../token-generator.js";

export function getTokenOpts(userId, partyuuid) {
    const scopes = CreateScopeString([
        AltinnScopes.PORTAL.ENDUSER
    ]);
    const tokenOpts = new PersonalTokenBuilder()
        .withScopes(scopes)
        .withUserId(userId)
        .withPartyUuid(partyuuid);
    return tokenOpts.build();
}

/**
 * Helper function to get from and to organizations/users for the current iteration, ensuring that they are not the same
 *
 * @param {object[]} list Organizations or users available to this VU.
 * @returns object with from and to organizations
 */
export function getFromTo(list) {
    const [from, to] = pickUnique(list, 2);
    return { from, to };
}
