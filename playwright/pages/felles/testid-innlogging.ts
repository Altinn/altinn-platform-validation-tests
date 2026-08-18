import { expect, Page } from "@playwright/test";
import { TestUser } from "../../config/environment";

/**
 * Innlogging med TestID hos ID-porten i testmiljøene. Brukes av testene som
 * sjekker selve innloggingsflyten; mockporten dekker resten.
 */
export class TestidInnlogging {
    constructor(private page: Page) { }

    async login(user: TestUser) {
        await this.page.locator('#testid1').click();
        await this.page.locator('input[name="pid"]').fill(user.pid);
        await this.page.locator('#submit').click();
    }

    async assertOnPage() {
        await expect(this.page.locator('#testid1'), 'Er på ID-porten-innlogging').toBeVisible();
    }
}
