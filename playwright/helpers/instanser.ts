import { expect, Page } from "@playwright/test";

import { ApiClient } from "../clients";
import { Instans } from "../pages/apps/app";
import { altinnToken } from "./sesjonsdata";

/**
 * Sletter `instans` i appen `app` for godt, med tokenet til brukeren som er logget inn på `page`.
 * Går også etter at instansen er sendt inn.
 *
 * Storage merker bare instansen som slettet, og fjerner den senere. Instansen kan fortsatt
 * hentes rett etterpå, så det er merket i svaret som sjekkes. Dialogen i innboksen forsvinner
 * med en gang.
 */
export async function slettInstans(api: ApiClient, page: Page, app: string, { partyId, guid }: Instans) {
    const token = await altinnToken(page);
    const response = await api.apps.instances.DeleteInstance(token, app, partyId, guid, true);
    expect(response.ok(), `Sletting av instans ${partyId}/${guid}: ${response.status()}`).toBe(true);

    const slettet: { status?: { isHardDeleted?: boolean } } = await response.json();
    expect(slettet.status?.isHardDeleted, `Instans ${partyId}/${guid} er merket som slettet`).toBe(true);
}
