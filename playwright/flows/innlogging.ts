import { expect, Page, test } from "@playwright/test";

import { Sprak } from "../config/sprak";
import { TestUser } from "../config/testdata";
import { IdportenInnlogging } from "../pages/felles/idporten-innlogging";
import { Meny } from "../pages/felles/meny";
import { REDIRECT_TIMEOUT } from "../pages/felles/navigasjon";
import { SyntetiskInnlogging } from "../pages/felles/syntetisk-innlogging";
import { Side } from "../pages/side";

// Sesjonscookiene skal være tømt når utloggingen er fullført.
const SESJONSCOOKIES = ["AltinnStudioRuntime", "altinnsession"];

/**
 * Innlogging går på tvers av alle flatene, og ligger derfor her framfor i et av
 * områdene.
 */
export class Innlogging {
    private meny: Meny;
    private idporten: IdportenInnlogging;
    private syntetisk: SyntetiskInnlogging;

    constructor(
        private page: Page,
        private brukMockporten: boolean,
        platform: string,
    ) {
        this.meny = new Meny(page);
        this.idporten = new IdportenInnlogging(page);
        this.syntetisk = new SyntetiskInnlogging(page, platform);
    }

    /**
     * Logger inn og lander på `side`. Dette er det eneste stedet det velges mellom
     * Mockporten og ID-porten, ut fra `mockporten` i playwright.config.ts.
     */
    async logIn(side: Side, user: TestUser) {
        if (this.brukMockporten) {
            await this.viaMockporten(side, user);
        } else {
            await side.navigateTo();
            await this.viaIdporten(side, user);
            // Infoportalen sender brukeren til arbeidsflaten etter innlogging.
            await side.navigateTo();
        }
    }

    /** Bare for testene der Mockporten er det som testes. Ellers logIn(). */
    async viaMockporten(side: Side, user: TestUser) {
        await test.step("Innlogging med Mockporten", async () => {
            await this.syntetisk.login(side.url, user);
        });
    }

    /**
     * Logger inn gjennom ID-porten fra `side`, som brukeren står på, uten å navigere
     * etterpå. Bare for testene der ID-porten-flyten er det som testes. Ellers logIn().
     */
    async viaIdporten(side: Side, user: TestUser) {
        await test.step("Innlogging med TestID", async () => {
            await side.startInnlogging();
            await this.idporten.login(user);
            await this.meny.lukkAktorvelger(user);
        });
    }

    /**
   * Logger ut fra flaten brukeren står på. Utloggingen er felles for flatene, på
   * samme måte som innloggingen.
   */
    async logOut() {
        const startUrl = this.page.url();
        // Fullfør navigasjonen til innloggingsleverandøren før testen åpner en flate igjen.
        await Promise.all([
            this.page.waitForURL((url) => url.href !== startUrl, {
                waitUntil: "load",
                timeout: REDIRECT_TIMEOUT,
            }),
            this.meny.clickLogoutButton(),
        ]);
    }

    /** Venter på at sesjonen er ryddet, også om flatene skulle være utilgjengelige. */
    async assertLoggedOut() {
        await expect.poll(
            async () => (await this.page.context().cookies())
                .filter((cookie) => SESJONSCOOKIES.includes(cookie.name) && cookie.value !== "")
                .map((cookie) => cookie.name),
            { message: "Sesjonscookiene er borte etter utlogging", timeout: REDIRECT_TIMEOUT },
        ).toEqual([]);
    }

    async assertOnIdportenLogin() {
        await this.idporten.assertOnPage();
    }

    async setLanguage(sprak: Sprak) {
        await this.meny.setLanguage(sprak);
    }

    async refresh() {
        await this.page.reload();
    }
}
