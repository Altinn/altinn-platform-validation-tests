import { expect, Page } from "@playwright/test";

export class Cookiebanner {

    constructor(private page: Page) { }

    async assertVisible() {
        await expect(
            this.banner(),
            'Cookiebanneret vises'
        ).toBeVisible();
    }

    async assertHidden() {
        await expect(
            this.banner(),
            'Cookiebanneret vises ikke'
        ).toBeHidden();
    }

    async godta() {
        await this.assertVisible();
        await this.jaKnapp().click();
    }

    async avsla() {
        await this.assertVisible();
        await this.neiKnapp().click();
    }

    private banner() {
        return this.page.getByText(
            /får vi samle informasjon om (hvordan|korleis) du bruker altinn|do you allow us to collect information about how you use altinn/i
        );
    }

    private jaKnapp() {
        return this.page.getByRole('button', { name: /^(ja|yes)$/i });
    }

    private neiKnapp() {
        return this.page.getByRole('button', { name: /^(nei|no)$/i });
    }
}
