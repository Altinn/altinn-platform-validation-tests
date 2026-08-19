import { expect, Page } from "@playwright/test";
import { baseUrls, TestUser } from "../../config/environment";
import { Side } from "../side";

export class InfoportalForside implements Side {
    readonly url = baseUrls.infoportal;

    constructor(private page: Page) { }

    // Infoportalen avbryter av og til navigeringen med net::ERR_ABORTED, uten at
    // siden faktisk feiler, så første forsøk får lov til å ryke.
    async navigateTo(maxAttempts = 3) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.page.goto(this.url, { timeout: 15_000 });
                return;
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);

                if (!message.includes('net::ERR_ABORTED') || attempt === maxAttempts) {
                    throw error;
                }

                console.warn(`Navigering avbrutt (${attempt}/${maxAttempts}): ${this.url}`);
            }
        }
    }

    // Infoportalen har ingen egen innloggingsindikator, så navnet på brukeren er
    // det vi har å gå etter.
    async assertLoggedIn(user: TestUser) {
        await this.assertOnPage();
        await expect(
            this.page.getByText(user.name).first(),
            'Brukeren er innlogget på infoportalen'
        ).toBeVisible({ timeout: 10_000 });
    }

    async assertOnPage() {
        await expect.poll(() => this.page.url()).toContain(new URL(this.url).origin);
    }
}
