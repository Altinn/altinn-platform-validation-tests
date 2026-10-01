import { expect, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Cookiebanner } from "../felles/cookiebanner";
import { Meny } from "../felles/meny";
import { assertFlateUtlogget } from "../felles/utlogget";

export class ArbeidsflateProfil {
    readonly url: string;

    constructor(
        private page: Page,
        arbeidsflate: string,
        readonly meny = new Meny(page),
        readonly cookiebanner = new Cookiebanner(page),
    ) {
        this.url = `${arbeidsflate}/profile`;
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

        // Lagrede søk ligger bare under profilen, og href-en er språkuavhengig.
        await expect(
            this.page.getByRole("complementary").locator("a[href=\"/profile/saved-searches\"]"),
            "Profilens sidemeny vises"
        ).toBeVisible();
    }
}
