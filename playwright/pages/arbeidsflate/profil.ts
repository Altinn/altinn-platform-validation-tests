import { expect, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Meny } from "../felles/meny";
import { gaaTil } from "../felles/navigasjon";
import { assertFlateUtlogget } from "../felles/utlogget";
import { Side } from "../side";

export class ArbeidsflateProfil implements Side {
    readonly url: string;

    constructor(
        private page: Page,
        arbeidsflate: string,
        private meny = new Meny(page),
    ) {
        this.url = `${arbeidsflate}/profile`;
    }

    async navigateTo() {
        await gaaTil(this.page, this.url);
    }

    // Flatene bak innlogging svarer likt for en utlogget bruker, så påstanden
    // ligger i `assertFlateUtlogget`.
    async assertLoggedOut(user: TestUser) {
        await assertFlateUtlogget(this.page, user);
    }

    async assertLoggedIn() {
        await this.meny.assertLoggedIn();

        // Lagrede søk ligger bare under profilen, og href-en er språkuavhengig.
        await expect(
            this.page.getByRole("complementary").locator("a[href=\"/profile/saved-searches\"]"),
            "Profilens sidemeny vises"
        ).toBeVisible();
    }
}
