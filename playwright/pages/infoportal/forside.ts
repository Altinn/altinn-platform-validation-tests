import { expect, Locator, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Sprak } from "../../config/sprak";
import { Cookiebanner } from "../felles/cookiebanner";
import { REDIRECT_TIMEOUT } from "../felles/navigasjon";

export class InfoportalForside {
    readonly loginButton: Locator;

    constructor(
        private page: Page,
        readonly url: string,
        readonly cookiebanner = new Cookiebanner(page),
    ) {
        this.loginButton = page.getByRole("button", { name: /logg inn|login/i }).first();
    }

    async navigateTo() {
        await this.page.goto(this.url, { waitUntil: "commit" });
    }

    // Infoportalen har ingen egen innloggingsindikator, så navnet på brukeren er
    // det vi har å gå etter.
    async assertLoggedIn(user: TestUser) {
        await this.assertOnPage();
        await expect(
            this.page.getByText(user.name).first(),
            "Brukeren er innlogget på infoportalen"
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
            this.loginButton,
            "Innloggingsknappen vises på infoportalen"
        ).toBeVisible({ timeout: REDIRECT_TIMEOUT });

        await expect(
            this.page.getByText(user.name).first(),
            "Brukeren er ikke innlogget på infoportalen"
        ).toBeHidden();
    }

    async assertOnPage() {
        await expect.poll(() => this.page.url()).toContain(new URL(this.url).origin);
    }

    async assertSprak(sprak: Sprak) {
        await this.assertOnPage();
        await expect(
            this.page.getByText(sporsmaal[sprak]),
            `Infoportalen viser "${sporsmaal[sprak]}"`
        ).toBeVisible();
    }
}

const sporsmaal: Record<Sprak, RegExp> = {
    [Sprak.Bokmaal]: /^hva vil du gjøre\?$/i,
    [Sprak.Nynorsk]: /^kva vil du gjere\?$/i,
    [Sprak.Engelsk]: /^what do you want to do\?$/i,
};
