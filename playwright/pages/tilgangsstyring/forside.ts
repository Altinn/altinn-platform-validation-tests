import { expect, Page } from "@playwright/test";
import { baseUrls } from "../../config/environment";
import { Sprak } from "../../config/sprak";
import { Seksjon, seksjonsnavn } from "./seksjoner";
import { Meny } from "../felles/meny";
import { Side } from "../side";

export class TilgangsstyringForside implements Side {
    readonly url = `${baseUrls.tilgangsstyring}/accessmanagement/ui`;

    // Språket kommer fra fixturen, så assertions slipper å ta det som argument.
    constructor(
        private page: Page,
        private sprak: Sprak,
        private meny = new Meny(page),
    ) { }

    async navigateTo() {
        await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    }

    async assertLoggedIn() {
        await expect(this.page, 'Er på tilgangsstyring forside').toHaveURL(this.url);
        await this.meny.assertLoggedIn();

        // Brukere-lenken i sidemenyen finnes på alle tilgangsstyringssidene, og
        // href-en er den samme uansett språk.
        await expect(
            this.page.getByRole('complementary').locator('a[href="/accessmanagement/ui/users"]'),
            'Tilgangsstyringens sidemeny vises'
        ).toBeVisible();
    }

    /**
     * Sjekker at nøyaktig de forventede seksjonene vises i sidemenyen. Hvilke det
     * er avhenger av brukerens tilganger, så testen sier hva den forventer.
     */
    async assertSections(forventet: Seksjon[]) {
        const sidebar = this.page.getByRole('complementary');
        const navn = seksjonsnavn[this.sprak];

        for (const seksjon of Object.values(Seksjon)) {
            const lenke = sidebar.getByLabel(navn[seksjon], { exact: true }).first();

            if (forventet.includes(seksjon)) {
                await expect(lenke, `Seksjonen "${navn[seksjon]}" vises`).toBeVisible();
            } else {
                await expect(lenke, `Seksjonen "${navn[seksjon]}" vises ikke`).toBeHidden();
            }
        }
    }
}
