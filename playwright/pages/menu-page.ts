import { expect, Page } from "@playwright/test";

export class MenuPage {

    constructor(private page: Page) { }

    async clickMenuButton() {
        const menuButton = this.page.getByRole('button', {
            name: /^(meny|menu)$/i,
        });
        await expect(menuButton).toBeVisible({ timeout: 10000 });
        // klikk logout
        await menuButton.click();
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

    async setLanguage(language: string) {
        await this.clickMenuButton();
        await this.page
            .locator('button[aria-label="Språk/language"]')
            .click();

        switch (language.toLowerCase()) {
            case 'bokmål':
                await this.page.locator('#no_nb').click();
                break;
            case 'nynorsk':
                await this.page.locator('#no_nn').click();
                break;
            case 'english':
            case 'engelsk':
                await this.page.locator('#en').click();
                break;
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }
}