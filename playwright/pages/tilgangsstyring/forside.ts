import { expect, Locator, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Sprak } from "../../config/sprak";
import { Cookiebanner } from "../felles/cookiebanner";
import { Meny } from "../felles/meny";
import { assertFlateUtlogget } from "../felles/utlogget";
import { Seksjon, seksjonsnavn, seksjonssti } from "./seksjoner";

// Brukes også av `Innlogging`, så stien står ett sted.
export const tilgangsstyringUrl = (tilgangsstyring: string) => `${tilgangsstyring}/accessmanagement/ui`;

export class TilgangsstyringForside {
    readonly url: string;

    readonly sidemeny: Locator;
    // Finnes på alle tilgangsstyringssidene, og href-en er den samme uansett språk.
    readonly brukereLink: Locator;

    // Språket kommer fra fixturen, så assertions slipper å ta det som argument.
    constructor(
        private page: Page,
        tilgangsstyring: string,
        private sprak: Sprak,
        readonly meny = new Meny(page),
        readonly cookiebanner = new Cookiebanner(page),
    ) {
        this.url = tilgangsstyringUrl(tilgangsstyring);

        this.sidemeny = page.getByRole("complementary");
        this.brukereLink = this.sidemeny.locator("a[href=\"/accessmanagement/ui/users\"]");
    }

    async navigateTo() {
        await this.page.goto(this.url, { waitUntil: "commit" });
    }

    // Flatene bak innlogging svarer likt for en utlogget bruker, så påstanden
    // ligger i `assertFlateUtlogget`.
    async assertLoggedOut(user: TestUser) {
        await assertFlateUtlogget(this.page, user);
    }

    async assertLoggedIn() {
        await this.meny.assertLoggedIn();

        await expect(this.brukereLink, "Tilgangsstyringens sidemeny vises").toBeVisible();
    }

    /**
     * Sjekker at nøyaktig de forventede seksjonene vises i sidemenyen. Hvilke det
     * er avhenger av brukerens tilganger, så testen sier hva den forventer.
     */
    async assertSections(forventet: Seksjon[]) {
        const navn = seksjonsnavn[this.sprak];

        for (const seksjon of Object.values(Seksjon)) {
            const lenke = this.sidemeny.locator(`a[href="/accessmanagement/ui/${seksjonssti[seksjon]}"]`);

            if (forventet.includes(seksjon)) {
                await expect(lenke, `Seksjonen "${navn[seksjon]}" vises`).toBeVisible();
            } else {
                await expect(lenke, `Seksjonen "${navn[seksjon]}" vises ikke`).toBeHidden();
            }
        }
    }
}
