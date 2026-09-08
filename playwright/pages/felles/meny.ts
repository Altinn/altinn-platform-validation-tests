import { expect, Page } from "@playwright/test";
import { Sprak } from "../../config/sprak";

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
