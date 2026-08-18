import { expect, Page } from "@playwright/test";
import { getSharedPassword, TestUser } from "../../config/environment";

/**
 * Innlogging via Test-IDP ("mockporten"), en syntetisk-only OIDC-upstream som
 * Altinn Authentication ruter til når `iss=mockporten` er med i login-URLen.
 * Skjemaet tar delt tilgangspassord og et syntetisk Tenor-fnr (måned 81-92).
 */
export class MockportenInnlogging {
    constructor(private page: Page) { }

    async login(user: TestUser) {
        await this.assertOnPage();
        await this.passwordField().fill(getSharedPassword());
        await this.pidField().fill(user.pid);
        await this.page.getByRole('button', { name: /log in as test user/i }).click();
    }

    async assertOnPage() {
        await expect(this.pidField(), 'Er på mockporten-innlogging').toBeVisible();
    }

    private passwordField() {
        return this.page.getByLabel(/shared access password/i);
    }

    private pidField() {
        return this.page.getByLabel(/fødselsnummer/i);
    }
}
