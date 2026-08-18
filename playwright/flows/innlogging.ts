import { Page } from "@playwright/test";
import { getLoginUrl, TestUser } from "../config/environment";
import { Sprak } from "../config/sprak";
import { Meny } from "../pages/felles/meny";
import { MockportenInnlogging } from "../pages/felles/mockporten-innlogging";
import { TestidInnlogging } from "../pages/felles/testid-innlogging";
import { Side } from "../pages/side";

/**
 * Innlogging går på tvers av alle flatene, og ligger derfor her framfor i et av
 * områdene.
 */
export class Innlogging {
    constructor(
        private page: Page,
        private meny = new Meny(page),
        private testid = new TestidInnlogging(page),
        private mockporten = new MockportenInnlogging(page),
    ) { }

    /**
     * Logger inn via mockporten og lander på siden som ble sendt inn. Flyten må
     * starte på Altinns login-endepunkt slik at `state` opprettes serverside; en
     * authorize-URL kan ikke gjenbrukes.
     */
    async withMockporten(side: Side, user: TestUser) {
        await this.page.goto(getLoginUrl(side.url), { waitUntil: 'domcontentloaded' });
        await this.mockporten.login(user);
    }

    /**
     * Logger inn med TestID hos ID-porten, altså slik en bruker gjør det. Brukes
     * av testene som sjekker innloggingsflyten selv.
     */
    async withTestid(user: TestUser) {
        if (!this.page.url().includes('idporten')) {
            await this.meny.clickLoginButton();
        }
        await this.testid.login(user);
    }

    async assertOnIdportenLogin() {
        await this.testid.assertOnPage();
    }

    async setLanguage(language: Sprak) {
        await this.meny.setLanguage(language);
    }

    async refresh() {
        await this.page.reload();
    }
}
