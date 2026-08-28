import { expect, Page } from "@playwright/test";
import { baseUrls, TestUser } from "../../config/environment";
import { Meny } from "../felles/meny";
import { gaaTil, erPaaSiden } from "../felles/navigasjon";
import { assertFlateUtlogget } from "../felles/utlogget";
import { Side } from "../side";

export class ArbeidsflateProfil implements Side {
    readonly url = `${baseUrls.arbeidsflate}/profile`;

    constructor(private page: Page, private meny = new Meny(page)) { }

    async navigateTo() {
        await gaaTil(this.page, this.url);
    }

    // Flatene bak innlogging svarer likt for en utlogget bruker, så påstanden
    // ligger i `assertFlateUtlogget`.
    async assertLoggedOut(user: TestUser) {
        await assertFlateUtlogget(this.page, user);
    }

    async assertLoggedIn() {
        await expect(this.page, 'Er på arbeidsflate profil').toHaveURL(erPaaSiden(this.url));
        await this.meny.assertLoggedIn();

        // Lagrede søk ligger bare under profilen, og href-en er språkuavhengig.
        await expect(
            this.page.getByRole('complementary').locator('a[href="/profile/saved-searches"]'),
            'Profilens sidemeny vises'
        ).toBeVisible();
    }
}
