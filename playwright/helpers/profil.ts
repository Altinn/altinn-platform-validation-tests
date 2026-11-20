import { expect } from "@playwright/test";

import { ApiClient } from "../clients";
import { UserProfile } from "../clients/profil/users";

/** Postadressen Profil har for brukeren `token` tilhører, slik profilsiden skal vise den. */
export async function hentPostadresse(api: ApiClient, token: string): Promise<string> {
    const response = await api.profil.users.GetCurrentUser(token);
    expect(response.ok(), `Henting av profilen: ${response.status()} ${await response.text()}`).toBe(true);

    const profil: UserProfile = await response.json();
    const adresse = profil.party?.person?.mailingAddress;
    expect(adresse, "Profil har en postadresse for brukeren").toBeTruthy();
    return adresse!;
}
