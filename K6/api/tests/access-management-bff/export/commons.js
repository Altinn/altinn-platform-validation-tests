import { AltinnScopes, CreateScopeString } from "../../../../scopes.js";
import { PersonalTokenBuilder } from "../../../../token-generator.js";

/**
 * Token options for acting as one end user.
 *
 * @param {string} userId Altinn user id.
 * @param {string} partyuuid Party UUID of that user.
 * @returns {ReturnType<PersonalTokenBuilder["build"]>} Options to hand to setTokenGeneratorOptions.
 */
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
