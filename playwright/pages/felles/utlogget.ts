import { expect, Page } from "@playwright/test";
import { TestUser } from "../../config/environment";
import { REDIRECT_TIMEOUT } from "./navigasjon";

/**
 * Hva en flate bak innlogging viser en utlogget bruker. Arbeidsflaten, profilen og
 * tilgangsstyringen svarer likt her, så påstanden står ett sted.
 *
 * Hvor brukeren havner er ikke låst, og det er med vilje: etter en utlogging sender
 * flaten henne noen ganger til ID-porten og blir andre ganger stående på seg selv
 * utlogget, i alle miljøer. Begge er greie utfall.
 *
 * At siden har rendret en hovednavigasjon sjekkes derfor først, slik at en side som
 * er nede ikke leses som utlogget bare fordi ingenting av det innloggede finnes å
 * vise. Deretter navnet: verken menyknappen eller sidemenyen sier noe her, appskallet
 * rendrer begge uten sesjon, mens navnet bare vises for en innlogget bruker. Det er
 * det samme signalet infoportalen bruker.
 *
 * At sesjonen faktisk er borte er det `Innlogging.assertLoggedOut` svarer for, på
 * cookiene, og det er den påstanden som ikke kan lures av et skjermbilde.
 *
 * @param page Siden som skal være utlogget.
 * @param user Brukeren som var innlogget, og hvis navn ikke skal vises lenger.
 */
export async function assertFlateUtlogget(page: Page, user: TestUser) {
    await expect(
        page.getByRole('banner'),
        'Siden har rendret en hovednavigasjon'
    ).toBeVisible({ timeout: REDIRECT_TIMEOUT });

    // Med romslig tid: appen rendrer av og til det innloggede skjermbildet fra
    // cache noen sekunder etter utloggingen, før den tar den inn over seg.
    await expect(
        page.getByText(user.name).first(),
        'Brukerens navn vises ikke'
    ).toBeHidden({ timeout: REDIRECT_TIMEOUT });
}
