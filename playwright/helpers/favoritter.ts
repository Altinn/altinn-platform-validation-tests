import { expect } from "@playwright/test";

import { ApiClient } from "../clients";
import { AuthorizedPartyDtoListPaginatedResult } from "../clients/access-management/authorized-parties";
import { GroupResponse } from "../clients/profil/favorites";

/** Party UUID-ene til favorittaktørene brukeren `token` tilhører har, slik Profil har dem lagret. */
export async function hentFavoritter(api: ApiClient, token: string): Promise<string[]> {
    const response = await api.profil.favorites.GetFavorites(token);
    expect(response.ok(), `Henting av favoritter: ${response.status()} ${await response.text()}`).toBe(true);

    const gruppe: GroupResponse = await response.json();
    return gruppe.parties ?? [];
}

/**
 * Fjerner favorittene brukeren har fått etter at `opprinnelige` ble lest, så favorittene
 * brukeren hadde fra før, blir stående.
 */
export async function fjernNyeFavoritter(api: ApiClient, token: string, opprinnelige: string[]) {
    const nye = (await hentFavoritter(api, token)).filter((uuid) => !opprinnelige.includes(uuid));

    for (const uuid of nye) {
        const response = await api.profil.favorites.DeleteFavorite(token, uuid);
        expect(response.ok(), `Sletting av favoritt ${uuid}: ${response.status()} ${await response.text()}`).toBe(true);
    }
}

/**
 * Party UUID-en til virksomheten med `orgnr`, blant aktørene brukeren `token` tilhører kan
 * representere, så den kan sammenlignes med favorittene. Underenhetene er med, og har sin egen UUID.
 */
export async function hentPartyUuid(api: ApiClient, token: string, orgnr: string): Promise<string> {
    const response = await api.accessManagement.authorizedParties.GetAuthorizedParties(token);
    expect(response.ok(), `Henting av aktørene brukeren kan representere: ${response.status()} ${await response.text()}`).toBe(true);

    const side: AuthorizedPartyDtoListPaginatedResult = await response.json();
    const aktorer = (side.data ?? []).flatMap((aktor) => [aktor, ...(aktor.subunits ?? [])]);
    const uuid = aktorer.find((aktor) => aktor.organizationNumber === orgnr)?.partyUuid;
    expect(uuid, `Brukeren kan representere ${orgnr}`).toBeTruthy();
    return uuid!;
}
