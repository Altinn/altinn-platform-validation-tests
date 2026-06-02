import { expect, Page } from "@playwright/test";

export class LoginPage {
    constructor(private page: Page) { }

    async loginWithTestUser(user: { pid: string; name: string }) {
        await this.selectTestUser();
        await this.fillPid(user.pid);
        await this.submit();
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

    async verifyOnPage() {
        await expect(this.page.locator('#testid1'), "Verify on idporten login").toBeVisible();
    }
}