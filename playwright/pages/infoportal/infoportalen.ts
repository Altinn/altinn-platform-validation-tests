import { expect, Page } from "@playwright/test";
import { getFullUrl } from "../../tests/common-functions";

export class InfoPortalen {
    private fullUrl = getFullUrl('infoportalen');
    constructor(private page: Page) { }

    async assertOnPage(user: { pid: string; name: string }) {
        await expect(
            this.page,
            'Assert on Infoportalen main page'
        ).toHaveURL(this.fullUrl);

        await expect(
            this.page.getByText(user.name).first(),
            'Verify that user is logged in on Infoportalen'
        ).toBeVisible({
            timeout: 10_000,
        });
    }

    async assertLoggedOut() {
        // infoportalen har ingen innloggingsindikator, så vi sjekker at vi er på riktig URL
        await expect
            .poll(() => this.page.url())
            .toContain(new URL(this.fullUrl).origin);
        // og at vi ser innloggingsknappen
        await expect(this.page.getByRole('button', {
            name: /logg inn|login/i,
        })).toBeVisible();
    }

    async navigateTo() {
        await this.page.goto(this.fullUrl, {
            waitUntil: 'domcontentloaded'
        });

        try {
            await this.page.goto(this.fullUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch (err: any) {
            if (String(err.message).includes('net::ERR_ABORTED')) {
                console.warn(`Navigation aborted, continuing: ${this.fullUrl}`);
            } else {
                throw err;
            }
        }
    }


}