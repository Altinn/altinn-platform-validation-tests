import { Page } from "@playwright/test";

/**
 * Starter en ny instans av en Altinn-app, som den innloggede brukeren akkurat
 * nå representerer (aktøren må være valgt i aktørbytteren på forhånd).
 *
 * Dette er den virkelige instansieringsveien en sluttbruker går gjennom —
 * ikke "skygge-dialogen" fra dialogporten-serviceowner-API-et
 * (`config/clients/dialogporten/serviceowner.ts`). OBS: en tidlig måling trodde dette også løste
 * Dialogportens synkroniseringsforsinkelse (fant en instans etter 4
 * sekunder), men det viste seg å være en forurenset måling — en grundigere
 * oppfølging fant ikke dialogen i det hele tatt etter 147 sekunder for en
 * fersk delegering. Forsinkelsen gjelder altså reelle app-instanser like mye
 * som skygge-dialoger; denne veien brukes likevel videre fordi den uansett
 * er den riktige (appens eget endepunkt), ikke fordi den er bevist raskere.
 * Se minnefila om Brukermønster test-H for hele historikken.
 *
 * Krever ingen egen API-nøkkel: appens eget instansierings-endepunkt
 * (`{appUrl}/instances`) godtar sluttbrukerens egen innloggingsøkt, i
 * motsetning til å kalle Storage-API-et (`/storage/api/v1/instances`)
 * direkte, som krever et eget APIM-abonnement ("AppsAccess") vi ikke har.
 */
export async function instansierApp(page: Page, appUrl: string, aktorNavn: string) {
    await page.goto(appUrl, { waitUntil: "domcontentloaded" });

    await page.getByText(aktorNavn, { exact: false }).first().click();

    await page.waitForURL(/#\/instance\//);
}
