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
     * Logger inn og lander på siden som ble sendt inn. Dette er veien testene skal
     * bruke når innloggingen er et middel og ikke det som testes.
     *
     * Under panseret går det via Test-IDP ("mockporten"). Flyten må starte på
     * Altinns login-endepunkt slik at `state` opprettes serverside; en
     * authorize-URL kan ikke gjenbrukes.
     */
    async logIn(side: Side, user: TestUser) {
        await this.page.goto(getLoginUrl(side.url), { waitUntil: 'domcontentloaded' });
        await this.mockporten.login(user);
    }

    /**
     * Logger inn med TestID hos ID-porten, altså gjennom skjermbildene en bruker
     * møter. Bare for testene der selve innloggingsflyten er det som testes.
     */
    async viaIdporten(user: TestUser) {
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
