import { Page } from "@playwright/test";

/**
 * Går til en URL, og lar `net::ERR_ABORTED` få et nytt forsøk.
 *
 * Flatene avbryter av og til navigeringen med `net::ERR_ABORTED` uten at siden
 * faktisk feiler. Det skjer særlig når en utlogget bruker går til en flate bak
 * innlogging: serveren svarer med en omdirigering samtidig som siden begynner å
 * laste, og da ryker navigeringen selv om neste forsøk går rett inn. Alle andre
 * feil kastes videre med en gang, siden de sier noe ekte om flaten.
 *
 * @param page Siden som skal navigere.
 * @param url URLen den skal til.
 * @param maxAttempts Hvor mange forsøk den får.
 */
export async function gaaTil(page: Page, url: string, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await page.goto(url, { timeout: 15_000 });
            return;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            if (!message.includes('net::ERR_ABORTED') || attempt === maxAttempts) {
                throw error;
            }

            console.warn(`Navigering avbrutt (${attempt}/${maxAttempts}): ${url}`);
        }
    }
}
