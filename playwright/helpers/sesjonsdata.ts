import { Page } from "@playwright/test";

async function cookie(page: Page, navn: string): Promise<string> {
    const verdi = (await page.context().cookies()).find((c) => c.name === navn)?.value;
    if (!verdi) {
        throw new Error(`Fant ikke ${navn}-cookien; er brukeren logget inn?`);
    }
    return verdi;
}

/** Altinn-tokenet til den innloggede brukeren, brukt som sluttbrukertoken mot API-ene. */
export function altinnToken(page: Page): Promise<string> {
    return cookie(page, "AltinnStudioRuntime");
}

/** Party id-en til aktøren som er valgt. */
export function aktivAktorPartyId(page: Page): Promise<string> {
    return cookie(page, "AltinnPartyId");
}

/** Party UUID-en til aktøren som er valgt. */
export function aktivAktorUuid(page: Page): Promise<string> {
    return cookie(page, "AltinnPartyUuid");
}
