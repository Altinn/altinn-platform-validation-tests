import { expect, Page } from "@playwright/test";
import { baseUrls } from "../../config/environment";
import { Meny } from "../felles/meny";
import { gaaTil } from "../felles/navigasjon";
import { Side } from "../side";

export class ArbeidsflateProfil implements Side {
    readonly url = `${baseUrls.arbeidsflate}/profile`;

    constructor(private page: Page, private meny = new Meny(page)) { }

    async navigateTo() {
        await gaaTil(this.page, this.url);
    }

    /**
     * Siden krever innlogging, så en utlogget bruker får den ikke å se. Hvor hun
     * havner er ikke fastlåst her: i testmiljøene sendes hun til ID-porten, mens
     * flaten i prod kan bli stående på seg selv utlogget først. Det som holder i
     * begge tilfeller er at ingenting av det innloggede vises.
     */
    async assertLoggedOut() {
        await this.meny.assertLoggedOut();

        await expect(
            this.page.getByRole('complementary').locator('a[href="/profile/saved-searches"]'),
            'Profilens sidemeny vises ikke'
        ).toBeHidden();
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
