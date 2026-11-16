import { expect } from "@playwright/test";

import { ApiClient } from "../clients";
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
