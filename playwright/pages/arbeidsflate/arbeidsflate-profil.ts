import { expect, Page } from "@playwright/test";
import { getFullUrl } from "../../tests/common-functions";

export class ArbeidsFlateProfil {
    private fullUrl = getFullUrl('arbeidsflate-profil');
    constructor(private page: Page) { }

    async assertOnPage() {
        await expect(this.page, 'Assert on ArbeidsFlate profil page').toHaveURL(this.fullUrl);
    }

    async navigateTo() {
        await this.page.goto(this.fullUrl, {
            waitUntil: 'domcontentloaded'
        });
    }
}