import { expect, Page } from "@playwright/test";
import { getFullUrl } from "../../tests/common-functions";

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

    async checkSectionsAreVisible(sections: string[]) {
        const sidebar = this.page.locator('aside');
        for (const section of sections) {
            await expect(
                sidebar.getByLabel(
                    section.trim(),
                    { exact: true }
                ).first()
            ).toBeVisible();
        }
    }
}