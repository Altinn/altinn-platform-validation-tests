import { expect, Page } from "@playwright/test";

export class LoginPage {
    constructor(private page: Page) { }

    async clickLoginButton() {
        await this.page.getByRole('button', {
            name: /logg inn|login/i,
        }).click();
    }

    async fillPid(pid: string) {
        await this.page.locator('input[name="pid"]').fill(pid);
    }

    async submit() {
        await this.page.locator('#submit').click();
    }

    async selectTestUser() {
        await this.page.locator('#testid1').click();
    }
}