import { expect, Locator, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Cookiebanner } from "../felles/cookiebanner";
import { Meny } from "../felles/meny";
import { assertFlateUtlogget } from "../felles/utlogget";

export class ArbeidsflateProfil {
    readonly url: string;

    // Lagrede søk i profilens sidemeny. href-en er språkuavhengig.
    readonly lagredeSokLink: Locator;

    constructor(
        private page: Page,
        arbeidsflate: string,
        readonly meny = new Meny(page),
        readonly cookiebanner = new Cookiebanner(page),
    ) {
        this.url = `${arbeidsflate}/profile`;

        this.lagredeSokLink = page
            .getByRole("complementary")
            .locator("a[href=\"/profile/saved-searches\"]");
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

        // Sidemenyen alene skiller ikke profilen fra innboksen: lagrede søk-lenken
        // finnes i begge.
        await expect(this.page, "Er på profilen").toHaveURL(this.url);

        await expect(this.lagredeSokLink, "Profilens sidemeny vises").toBeVisible();
    }
}
