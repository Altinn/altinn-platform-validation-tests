import { Page } from "@playwright/test";
import { Sprak } from "../config/sprak";
import { TestUser } from "../config/environment";
import { IdportenInnlogging } from "../pages/felles/idporten-innlogging";
import { Meny } from "../pages/felles/meny";
import { SyntetiskInnlogging } from "../pages/felles/syntetisk-innlogging";
import { Side } from "../pages/side";
import { gjeldendeMiljo } from "../miljo";

/**
 * Innlogging går på tvers av alle flatene, og ligger derfor her framfor i et av
 * områdene.
 */
export class Innlogging {
    private meny: Meny;
    private idporten: IdportenInnlogging;
    private syntetisk: SyntetiskInnlogging;

    constructor(private page: Page) {
        this.meny = new Meny(page);
        this.idporten = new IdportenInnlogging(page);
        this.syntetisk = new SyntetiskInnlogging(page);
    }

    /**
     * Logger inn og lander på siden som ble sendt inn. Dette er veien testene skal
     * bruke når innloggingen er et middel og ikke det som testes.
     */
    async logIn(side: Side, user: TestUser) {
        await this.syntetisk.login(side.url, user);
    }

    /**
     * Logger inn gjennom ID-porten-skjermbildene. Bare for testene der selve
     * innloggingsflyten er det som testes.
     */
    async viaIdporten(user: TestUser) {
        if (!this.page.url().includes('idporten')) {
            await this.meny.clickLoginButton();
        }
        await this.idporten.login(user);
    }

    /**
     * Logger inn fra flaten brukeren står på, og lander på `landing`. I testmiljøene
     * går det gjennom ID-porten-skjermbildene.
     */
    async viaInnloggingsflyten(landing: Side, user: TestUser) {
        if (gjeldendeMiljo() === 'prod') {
            await this.syntetisk.login(landing.url, user);
            return;
        }

        await this.viaIdporten(user);
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
