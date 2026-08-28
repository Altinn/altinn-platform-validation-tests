import { Page } from "@playwright/test";

/**
 * Hvor lenge en flate får på å komme til rette etter en utlogging. Playwrights
 * standard på fem sekunder er for kort: flaten omdirigerer noen ganger til ID-porten
 * og rendrer andre ganger seg selv utlogget, og begge veiene kan bruke lengre tid
 * enn det.
 */
export const REDIRECT_TIMEOUT = 20_000;

/**
 * Går til en URL, og lar `net::ERR_ABORTED` få et nytt forsøk.
 *
 * Flatene avbryter av og til navigeringen med `net::ERR_ABORTED` uten at siden
 * faktisk feiler. Det skjer særlig når en utlogget bruker går til en flate bak
 * innlogging: serveren svarer med en omdirigering samtidig som siden begynner å
 * laste, og da ryker navigeringen selv om neste forsøk går rett inn. Alle andre
 * feil kastes videre med en gang, siden de sier noe ekte om flaten.
 *
 * Tallene er valgt slik at forsøkene får plass i testens eget budsjett: to forsøk à
 * 20 sekunder er 40, mens en test har 60. Tre forsøk à 30 ville vart lenger enn
 * testen selv, og da hadde en treg flate blitt rapportert som en test-timeout uten
 * spor av hva navigeringen ventet på. Infoportalen sender inn sitt eget tak.
 *
 * @param page Siden som skal navigere.
 * @param url URLen den skal til.
 * @param timeout Hvor lenge hvert forsøk får bruke.
 * @param maxAttempts Hvor mange forsøk den får.
 */
export async function gaaTil(page: Page, url: string, timeout = 20_000, maxAttempts = 2) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await page.goto(url, { timeout });
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
