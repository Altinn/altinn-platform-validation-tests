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

/** Party UUID-en til aktøren som er valgt. */
export function aktivAktorUuid(page: Page): Promise<string> {
    return cookie(page, "AltinnPartyUuid");
}

/**
 * Bruker-id-en og party-id-en til den innloggede brukeren, lest fra Altinn-tokenet. Et token fra
 * token-generatoren trenger dem for å bli godtatt som brukerens eget.
 */
export async function brukerIder(page: Page): Promise<{ userId: string; partyId: string }> {
    const [, payload] = (await altinnToken(page)).split(".");
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    return { userId: String(claims["urn:altinn:userid"]), partyId: String(claims["urn:altinn:partyid"]) };
}
