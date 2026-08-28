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
 * Timeouten er Playwrights egen standard, slik at flatene beholder den de hadde. Et
 * strammere tak her ville også truffet testene som ikke logger ut, og en kald flate
 * som svarer etter 20 sekunder ville begynt å feile. Infoportalen sender inn sitt
 * eget, som er det den hadde før denne hjelperen fantes.
 *
 * @param page Siden som skal navigere.
 * @param url URLen den skal til.
 * @param timeout Hvor lenge hvert forsøk får bruke.
 * @param maxAttempts Hvor mange forsøk den får.
 */
export async function gaaTil(page: Page, url: string, timeout = 30_000, maxAttempts = 3) {
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

/**
 * Sier om siden er den samme som `url`, uansett hva flaten har hengt på etter den.
 *
 * Testene spør etter hvilken side brukeren er på, ikke etter en URL på tegnet. Flatene
 * legger av og til på en spørrestreng selv: tilgangsstyring kommer for eksempel tilbake
 * fra innloggingen på `?openAccountMenu=true`. Det er verten og stien som skiller sidene
 * fra hverandre, så det er de som sammenlignes.
 *
 * @param url Sidens URL, uten spørrestreng.
 */
export function erPaaSiden(url: string) {
    const forventet = new URL(url);

    return (faktisk: URL) =>
        faktisk.origin === forventet.origin && faktisk.pathname === forventet.pathname;
}
