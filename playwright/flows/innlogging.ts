import { expect, Page } from "@playwright/test";
import { Sprak } from "../config/sprak";
import { TestUser } from "../config/environment";
import { IdportenInnlogging } from "../pages/felles/idporten-innlogging";
import { Meny } from "../pages/felles/meny";
import { SyntetiskInnlogging } from "../pages/felles/syntetisk-innlogging";
import { REDIRECT_TIMEOUT } from "../pages/felles/navigasjon";
import { Side } from "../pages/side";
import { gjeldendeMiljo } from "../miljo";

/**
 * Cookiene sesjonen faktisk ligger i. `AltinnStudioRuntime` er Altinn-tokenet og
 * `altinnsession` sesjonen bak det, og begge settes på domenet flatene deler.
 * Verifisert i at23, tt02 og prod: de to er nøyaktig de som forsvinner ved
 * utlogging, mens `AltinnPartyId`, `AltinnPartyUuid` og `altinnPersistentContext`
 * blir liggende.
 */
const SESJONSCOOKIES = ['AltinnStudioRuntime', 'altinnsession'];

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

    /**
     * Logger ut fra flaten brukeren står på. Utloggingen er felles for flatene, på
     * samme måte som innloggingen.
     */
    async logOut() {
        await this.meny.clickLogoutButton();
    }

    /**
     * At sesjonen er borte, og ikke bare at det innloggede ikke vises.
     *
     * Cookiene er det utloggingen kan holdes til: en flate som er nede ser utlogget
     * ut uansett, mens en sesjonscookie som ligger igjen betyr at `/logout` ikke
     * gjorde jobben sin selv om skjermbildet skulle si noe annet.
     *
     * Ventingen hører hit og ikke i testen: utloggingen går via ID-porten og tilbake
     * til `/logout/handleloggedout`, og cookiene ryddes først når den kjeden er
     * ferdig. Den som venter på dette venter samtidig på at utloggingen er fullført,
     * som er nettopp det en test vil før den ser på flatene.
     */
    async assertLoggedOut() {
        await expect
            .poll(async () => (await this.page.context().cookies())
                .filter((cookie) => SESJONSCOOKIES.includes(cookie.name) && cookie.value !== '')
                .map((cookie) => cookie.name), {
                message: 'Sesjonscookiene er borte etter utlogging',
                timeout: REDIRECT_TIMEOUT,
            })
            .toEqual([]);
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
