import { expect, Page } from "@playwright/test";
import { baseUrls, TestUser } from "../../config/environment";
import { Meny } from "../felles/meny";
import { gaaTil, REDIRECT_TIMEOUT } from "../felles/navigasjon";
import { Side } from "../side";

export class ArbeidsflateForside implements Side {
    readonly url = baseUrls.arbeidsflate;

    constructor(private page: Page, private meny = new Meny(page)) { }

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
        await expect(this.page, 'Er på arbeidsflate forside').toHaveURL(this.url);
        await this.meny.assertLoggedIn();

        // Utkast-lenken i sidemenyen finnes bare på innboksen, og href-en er den
        // samme uansett språk.
        await expect(
            this.page.getByRole('complementary').locator('a[href="/drafts"]'),
            'Innboksens sidemeny vises'
        ).toBeVisible();
    }
}
