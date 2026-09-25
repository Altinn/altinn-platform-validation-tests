import { expect, Page } from "@playwright/test";

import { Sprak } from "../../config/sprak";
import { TestUser } from "../../config/testdata";
import { Meny } from "../felles/meny";
import { gaaTil, REDIRECT_TIMEOUT, ventPaaIdporten } from "../felles/navigasjon";
import { Side } from "../side";

export class InfoportalForside implements Side {
    constructor(
        private page: Page,
        readonly url: string,
        private meny = new Meny(page),
    ) {}

    // Litt lenger timeout fordi infoportalen laster mye innhold
    async navigateTo() {
        await gaaTil(this.page, this.url, 15_000);
    }

    // Infoportalen er åpen, så innloggingen starter med knappen i headeren.
    async startInnlogging() {
        await this.meny.clickLoginButton();
        await ventPaaIdporten(this.page);
    }

    // Infoportalen har ingen egen innloggingsindikator, så navnet på brukeren er
    // det vi har å gå etter.
    async assertLoggedIn(user: TestUser) {
        await this.assertOnPage();
        await expect(
            this.page.getByText(user.name).first(),
            "Brukeren er innlogget på infoportalen",
        ).toBeVisible();
    }

    /**
   * Infoportalen er åpen, så en utlogget bruker blir stående på siden. Det er
   * innloggingsknappen som sier at siden faktisk har rendret utlogget, siden et
   * navn som ikke er der ennå ser likt ut som et navn som er borte.
   */
    async assertLoggedOut(user: TestUser) {
        await this.assertOnPage();

        await expect(
            this.page.getByRole("button", { name: /logg inn|login/i }).first(),
            "Innloggingsknappen vises på infoportalen",
        ).toBeVisible({ timeout: REDIRECT_TIMEOUT });

        await expect(
            this.page.getByText(user.name).first(),
            "Brukeren er ikke innlogget på infoportalen",
        ).toBeHidden();
    }

    async assertOnPage() {
        await expect(this.page, "Er på infoportalen").toHaveURL(
            (url) => url.origin === new URL(this.url).origin,
        );

        await expect(
            this.page.getByRole("main"),
            "Infoportalen har rendret innholdet",
        ).toBeVisible();
    }

    async assertSprak(sprak: Sprak) {
        await this.assertOnPage();
        await expect(
            this.page.getByText(sporsmaal[sprak]),
            `Infoportalen viser "${sporsmaal[sprak]}"`,
        ).toBeVisible();
    }
}

const sporsmaal: Record<Sprak, RegExp> = {
    [Sprak.Bokmaal]: /^hva vil du gjøre\?$/i,
    [Sprak.Nynorsk]: /^kva vil du gjere\?$/i,
    [Sprak.Engelsk]: /^what do you want to do\?$/i,
};
