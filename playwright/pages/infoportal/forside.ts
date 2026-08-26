import { expect, Page } from "@playwright/test";
import { baseUrls, TestUser } from "../../config/environment";
import { gaaTil } from "../felles/navigasjon";
import { Side } from "../side";

export class InfoportalForside implements Side {
    readonly url = baseUrls.infoportal;

    constructor(private page: Page) { }

    async navigateTo() {
        await gaaTil(this.page, this.url);
    }

    // Infoportalen har ingen egen innloggingsindikator, så navnet på brukeren er
    // det vi har å gå etter.
    async assertLoggedIn(user: TestUser) {
        await this.assertOnPage();
        await expect(
            this.page.getByText(user.name).first(),
            'Brukeren er innlogget på infoportalen'
        ).toBeVisible({ timeout: 10_000 });
    }

    /**
     * Infoportalen er åpen, så en utlogget bruker blir stående på siden. Det er
     * innloggingsknappen som sier at siden faktisk har rendret utlogget, siden et
     * navn som ikke er der ennå ser likt ut som et navn som er borte.
     */
    async assertLoggedOut(user: TestUser) {
        await this.assertOnPage();

        await expect(
            this.page.getByRole('button', { name: /logg inn|login/i }).first(),
            'Innloggingsknappen vises på infoportalen'
        ).toBeVisible({ timeout: 15_000 });

        await expect(
            this.page.getByText(user.name).first(),
            'Brukeren er ikke innlogget på infoportalen'
        ).toBeHidden();
    }

    async assertOnPage() {
        await expect.poll(() => this.page.url()).toContain(new URL(this.url).origin);
    }
}
