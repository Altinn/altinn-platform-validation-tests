import { expect, Page } from "@playwright/test";
import { Sprak } from "../../config/sprak";

export class Meny {

    constructor(private page: Page) { }

    async clickMenuButton() {
        await expect(this.menuButton()).toBeVisible({ timeout: 10_000 });
        await this.menuButton().click();
    }

    /**
     * Menyknappen i hovednavigasjonen finnes bare når brukeren er innlogget;
     * utlogget står det "Logg inn" der i stedet.
     */
    async assertLoggedIn() {
        await expect(
            this.menuButton(),
            'Menyknappen i hovednavigasjonen vises'
        ).toBeVisible({ timeout: 15_000 });
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

    async clickLogoutButton() {
        // vent på logout
        const logoutButton = this.page.getByRole('button', {
            name: /logg ut|log out/i,
        });
        await expect(logoutButton).toBeVisible({ timeout: 10000 });
        // klikk logout
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
