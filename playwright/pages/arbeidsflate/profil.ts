import { expect, Page } from "@playwright/test";
import { baseUrls } from "../../config/environment";
import { Meny } from "../felles/meny";
import { Side } from "../side";

export class ArbeidsflateProfil implements Side {
    readonly url = `${baseUrls.arbeidsflate}/profile`;

    constructor(private page: Page, private meny = new Meny(page)) { }

    async navigateTo() {
        await this.page.goto(this.url);
    }

    async assertLoggedIn() {
        await expect(this.page, 'Er på arbeidsflate profil').toHaveURL(this.url);
        await this.meny.assertLoggedIn();

        // Lagrede søk ligger bare under profilen, og href-en er språkuavhengig.
        await expect(
            this.page.getByRole('complementary').locator('a[href="/profile/saved-searches"]'),
            'Profilens sidemeny vises'
        ).toBeVisible();
    }
}
