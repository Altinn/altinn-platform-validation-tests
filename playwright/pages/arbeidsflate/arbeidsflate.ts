import { expect, Page } from "@playwright/test";
import { getFullUrl } from "../../tests/common-functions";

export class ArbeidsFlate {
    private fullUrl = getFullUrl('arbeidsflate');
    constructor(private page: Page) { }

    async assertOnPage() {
        await expect(this.page, 'Assert on ArbeidsFlate main page').toHaveURL(this.fullUrl);
    }

    async navigateTo() {
        await this.page.goto(this.fullUrl, {
            waitUntil: 'domcontentloaded'
        });
    }
}