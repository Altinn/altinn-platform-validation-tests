import { expect, Locator, Page } from "@playwright/test";

import { requireEnv, TestUser, Urler } from "../../config/environment";
import { Sprak } from "../../config/sprak";
import { InfoportalForside } from "../infoportal/forside";
import { tilgangsstyringUrl } from "../tilgangsstyring/forside";
import { Meny } from "./meny";
import { REDIRECT_TIMEOUT } from "./navigasjon";

/**
 * Cookiene sesjonen faktisk ligger i. `AltinnStudioRuntime` er Altinn-tokenet og
 * `altinnsession` sesjonen bak det. Verifisert i at23, tt02 og prod: de to er
 * nøyaktig de som forsvinner ved utlogging.
 */
const SESJONSCOOKIES = ["AltinnStudioRuntime", "altinnsession"];

/**
 * Innloggingen går via en av de to hovedsidene, arbeidsflaten eller tilgangsstyring.
 * Om den går via ID-porten med TestID eller via Mockporten styres av `mockporten` i
 * projectet, siden TestID ikke finnes i prod.
 *
 * Språket er ikke valgt ennå ved innlogging, så tekstene her matches på alle språk.
 */
export class Innlogging {
    private readonly meny: Meny;
    // Innloggingen via arbeidsflaten starter på infoportalens "Logg inn"-knapp.
    private readonly infoportal: InfoportalForside;

    // Mockporten
    readonly passwordField: Locator;
    readonly mockportenPidField: Locator;
    readonly testUserLoginButton: Locator;

    // ID-porten med TestID
    readonly testIdHoytNivaaLink: Locator;
    readonly idportenPidField: Locator;
    readonly submitButton: Locator;

    // Forankret, så et framtidig "Logg ut av alle enheter" ikke treffes.
    readonly logoutButton: Locator;

    constructor(
        private page: Page,
        private urler: Urler,
        private mockporten: boolean,
        sprak: Sprak,
    ) {
        this.meny = new Meny(page);
        this.infoportal = new InfoportalForside(page, urler.infoportal, sprak);

        this.passwordField = page.getByLabel(/shared access password/i);
        this.mockportenPidField = page.getByLabel(/fødselsnummer/i);
        this.testUserLoginButton = page.getByRole("button", {
            name: /log in as test user/i,
        });

        // Med denne får du nivå 4-innlogging
        this.testIdHoytNivaaLink = page.getByRole("link", { name: /TestID på nivå høyt/i });
        this.idportenPidField = page.locator("input[name=\"pid\"]");
        this.submitButton = page.locator("#submit");

        this.logoutButton = page
            .getByRole("button", { name: /^(logg ut|log out)$/i })
            .first();
    }

    /**
     * Logger inn fra infoportalens "Logg inn"-knapp, som lander på arbeidsflaten.
     * Med Mockporten er det `goto` som bestemmer flaten.
     */
    async loggInnViaArbeidsflate(user: TestUser) {
        if (this.mockporten) {
            await this.loggInnMedMockporten(this.urler.arbeidsflate, user);
            return;
        }

        await this.page.goto(this.urler.infoportal);
        await this.infoportal.loginButton.click();
        await this.loggInnMedTestId(user);
    }

    /**
     * Logger inn fra Tilgangsstyring i infoportalens meny, som lander på
     * tilgangsstyring. Med Mockporten er det `goto` som bestemmer flaten.
     *
     * Tilgangsstyring legger selv på `openAccountMenu=true` når den sender brukeren til
     * innlogging, og det er den som åpner aktørvelgeren etterpå. Mockporten-flyten går
     * forbi det, så parameteren legges på her.
     */
    async loggInnViaTilgangsstyring(user: TestUser) {
        if (this.mockporten) {
            await this.loggInnMedMockporten(`${tilgangsstyringUrl(this.urler.tilgangsstyring)}?openAccountMenu=true`, user);
            return;
        }

        await this.page.goto(this.urler.infoportal);
        await this.meny.gaTilTilgangsstyring();
        await this.loggInnMedTestId(user);
    }

    /**
     * Logger inn fra en direkte lenke, slik en bruker som kommer fra et varsel eller et
     * bokmerke gjør: siden sender brukeren til innlogging og tilbake etterpå.
     */
    async loggInnFraDyplenke(url: string, user: TestUser) {
        if (this.mockporten) {
            await this.loggInnMedMockporten(url, user);
            return;
        }

        await this.page.goto(url);
        await this.loggInnMedTestId(user);
    }

    /**
     * Fortsetter fra ID-portens valg av innloggingsmetode. Sjekker at valget er der
     * først, så en redirect som ikke kommer fram feiler her og ikke på klikket.
     */
    private async loggInnMedTestId(user: TestUser) {
        await expect(this.testIdHoytNivaaLink, "Er på ID-porten").toBeVisible({
            timeout: REDIRECT_TIMEOUT,
        });
        await this.testIdHoytNivaaLink.click();
        await this.idportenPidField.fill(user.pid);
        await this.submitButton.click();
    }

    /**
     * Flyten må starte på Altinns login-endepunkt, siden `state` opprettes
     * serverside; en authorize-URL kan ikke bygges her eller gjenbrukes.
     */
    private async loggInnMedMockporten(goto: string, user: TestUser) {
        await this.page.goto(
            `${this.urler.platform}/authentication/api/v1/authentication?goto=${encodeURIComponent(goto)}&iss=mockporten`,
        );

        // Tjenesten låser seg globalt etter fem feilforsøk, så testen skal feile
        // på et manglende passord framfor å prøve seg fram.
        await expect(this.mockportenPidField, "Er på Mockporten").toBeVisible();
        await this.passwordField.fill(requireEnv("TEST_IDP_PASSWORD"));
        await this.mockportenPidField.fill(user.pid);
        await this.testUserLoginButton.click();
    }

    /**
     * Logger ut og venter til sesjonscookiene er borte. En flate som er nede ser
     * utlogget ut uansett, mens en cookie som ligger igjen betyr at `/logout` ikke
     * gjorde jobben sin. Cookiene ryddes først når kjeden via ID-porten og tilbake
     * til `/logout/handleloggedout` er ferdig, så ventingen hører til utloggingen.
     */
    async loggUt() {
        await this.meny.clickMenuButton();

        await expect(this.logoutButton, "Logg ut ligger i menyen").toBeEnabled();
        await this.logoutButton.click();

        await expect
            .poll(
                async () =>
                    (await this.page.context().cookies())
                        .filter(
                            (cookie) =>
                                SESJONSCOOKIES.includes(cookie.name) && cookie.value !== "",
                        )
                        .map((cookie) => cookie.name),
                {
                    message: "Sesjonscookiene er borte etter utlogging",
                    timeout: REDIRECT_TIMEOUT,
                },
            )
            .toEqual([]);
    }
}
