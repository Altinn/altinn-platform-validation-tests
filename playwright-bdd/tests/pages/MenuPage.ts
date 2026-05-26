import { expect, Page } from "@playwright/test";

export class MenuPage {
    constructor(private page: Page) { }

    async clickMenuButton() {
        await this.page.getByRole('button', {
            name: /^(meny|menu)$/i,
        }).click();
    }

    async clickLogoutButton() {
        // vent på logout
        const logoutButton = this.page.getByRole('button', {
            name: /logg ut|logout/i,
        });
        await expect(logoutButton).toBeVisible({ timeout: 10000 });
        // klikk logout
        await logoutButton.click();
    }
}