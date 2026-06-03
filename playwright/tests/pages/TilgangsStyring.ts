import { expect, Page } from "@playwright/test";
import { getFullUrl } from "../common-functions";

export class TilgangsStyring {
    private fullUrl = getFullUrl('tilgangsstyring');
    constructor(private page: Page) { }

    async assertOnPage() {
        await expect(this.page, 'Assert on Tilgangsstyring main page').toHaveURL(this.fullUrl);
    }

    async navigateTo() {
        await this.page.goto(this.fullUrl, {
            waitUntil: 'domcontentloaded'
        });
    }
}