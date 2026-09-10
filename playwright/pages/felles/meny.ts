import { expect, Page } from "@playwright/test";
import { Sprak } from "../../config/sprak";
import { REDIRECT_TIMEOUT } from "./navigasjon";

export class Meny {

    constructor(private page: Page) { }

    /**
     * Venter på at knappen er aktivert og ikke bare synlig. Headeren rendrer den
     * `disabled` mens den henter det den trenger, og `click()` blokkerer da uten
     * egen timeout til testen har brukt opp tiden sin. Det har skjedd, se
     * `helpers/junitparser/example-junit-report.xml`.
     */
    async clickMenuButton() {
        await expect(
            this.menuButton(),
            'Menyknappen i hovednavigasjonen er klar'
        ).toBeEnabled({ timeout: 15_000 });

        await this.menuButton().click();
    }

    /**
     * Menyknappen i hovednavigasjonen finnes bare når brukeren er innlogget;
     * utlogget står det "Logg inn" der i stedet. Sjekker at den er aktivert, slik at
     * innlogget betyr en header som er til å bruke og ikke bare en som er rendret.
     */
    async assertLoggedIn() {
        await expect(
            this.menuButton(),
            'Menyknappen i hovednavigasjonen er klar'
        ).toBeEnabled({ timeout: 15_000 });
    }

    /**
     * Tilgangsstyring sender brukeren tilbake fra innloggingen på
     * ?openAccountMenu=true, som åpner aktørvelgeren. Menyknappen er disabled så
     * lenge velgeren står åpen, så en test må svare på den først. Å lukke den er
     * svaret: brukeren representerer seg selv fra før.
     *
     * Venter på at én av de to tilstandene inntreffer, siden velgeren åpner seg
     * et lite øyeblikk etter at flaten er tilbake, og ikke på alle flatene.
     */
    async lukkAktorvelger() {
        await expect
            .poll(
                async () =>
                    (await this.aktorvelger().isVisible()) || (await this.menuButton().isEnabled()),
                {
                    message: 'Aktørvelgeren eller menyknappen er kommet',
                    timeout: REDIRECT_TIMEOUT,
                }
            )
            .toBe(true);

        if (await this.aktorvelger().isVisible()) {
            await this.segSelv().click();
            await expect(this.aktorvelger(), 'Aktørvelgeren er lukket').toBeHidden();
        }
    }

    /**
     * Brukeren selv i aktørvelgeren. Personer står med fødselsdato der
     * virksomhetene står med organisasjonsnummer, og lista er virtualisert, så
     * det er ikke gitt at alle valgene finnes i DOM-en.
     */
    private segSelv() {
        return this.aktorvelger()
            .getByRole('menuitem')
            .filter({ hasText: /(Født|Born):/ })
            .first();
    }

    private aktorvelger() {
        return this.page.getByRole('dialog').filter({
            has: this.page.getByRole('heading', {
                name: /vegner av|vegne av|behalf of/i,
            }),
        });
    }

    private menuButton() {
        return this.page.getByRole('banner').getByRole('button', {
            name: /^(meny|menu)$/i,
        });
    }

    async clickLoginButton() {
        await this.page.getByRole('button', {
            name: /logg inn|login/i,
        }).click();
    }

    /**
     * Utloggingen ligger i menyen, så den må åpnes først. Navnet er forankret, slik
     * menyknappens er: uforankret ville et framtidig "Logg ut av alle enheter" også
     * truffet.
     */
    async clickLogoutButton() {
        await this.clickMenuButton();

        const logoutButton = this.page.getByRole('button', {
            name: /^(logg ut|log out)$/i,
        }).first();

        await expect(logoutButton, 'Logg ut ligger i menyen').toBeEnabled();
        await logoutButton.click();
    }

    async setLanguage(language: Sprak) {
        await this.clickMenuButton();
        await this.page
            .getByRole('menuitem', { name: 'Språk/language' })
            .click();

        // Sprakvalgene har ikke lenger id-er, så de velges på rollen sin.
        await this.page
            .getByRole('menuitemradio', { name: languageLabels[language] })
            .click();
    }
}

const languageLabels: Record<Sprak, string> = {
    [Sprak.Bokmaal]: 'Norsk (bokmål)',
    [Sprak.Nynorsk]: 'Norsk (nynorsk)',
    [Sprak.Engelsk]: 'English',
};
