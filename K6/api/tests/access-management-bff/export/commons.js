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
