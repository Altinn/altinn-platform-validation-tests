import { expect, Page } from "@playwright/test";
import { baseUrls, TestUser } from "../../config/environment";
import { Sprak } from "../../config/sprak";
import { Seksjon, seksjonsnavn } from "./seksjoner";
import { Meny } from "../felles/meny";
import { gaaTil, REDIRECT_TIMEOUT } from "../felles/navigasjon";
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
        await gaaTil(this.page, this.url);
    }

    /**
     * Siden krever innlogging, så en utlogget bruker får den ikke å se. Hvor hun
     * havner er ikke låst her, og det er med vilje: etter en utlogging sender flaten
     * henne noen ganger til ID-porten og blir andre ganger stående på seg selv
     * utlogget, i alle miljøer. Begge er greie utfall.
     *
     * At siden har rendret en hovednavigasjon sjekkes derfor først, slik at en side
     * som er nede ikke leses som utlogget bare fordi ingenting av det innloggede
     * finnes å vise. Deretter navnet: verken menyknappen eller sidemenyen sier noe
     * her, appskallet rendrer begge uten sesjon, mens navnet bare vises for en
     * innlogget bruker. Det er det samme signalet infoportalen bruker.
     *
     * At sesjonen faktisk er borte er det `Innlogging.assertLoggedOut` svarer for, på
     * cookiene, og det er den påstanden som ikke kan lures av et skjermbilde.
     */
    async assertLoggedOut(user: TestUser) {
        await expect(
            this.page.getByRole('banner'),
            'Siden har rendret en hovednavigasjon'
        ).toBeVisible({ timeout: REDIRECT_TIMEOUT });

        // Med romslig tid: appen rendrer av og til det innloggede skjermbildet fra
        // cache noen sekunder etter utloggingen, før den tar den inn over seg.
        await expect(
            this.page.getByText(user.name).first(),
            'Brukerens navn vises ikke'
        ).toBeHidden({ timeout: REDIRECT_TIMEOUT });
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
