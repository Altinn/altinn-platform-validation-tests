import { expect, Locator, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Sprak } from "../../config/sprak";
import { CookiebannerPom } from "../felles/cookiebanner";
import { MenyPom } from "../felles/meny";
import { assertFlateUtlogget } from "../felles/utlogget";

export class ArbeidsflateProfilPom {
    readonly url: string;

    // Lagrede søk i profilens sidemeny. href-en er språkuavhengig.
    readonly lagredeSokLink: Locator;

    constructor(
        private page: Page,
        arbeidsflate: string,
        readonly sprak: Sprak,
        readonly meny = new MenyPom(page),
        readonly cookiebanner = new CookiebannerPom(page),
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
        // finnes i begge. Stien sjekkes, så query-parametre ikke gir falsk feil.
        await expect
            .poll(() => new URL(this.page.url()).pathname, { message: "Er på profilen" })
            .toBe(new URL(this.url).pathname);

        await expect(this.lagredeSokLink, "Profilens sidemeny vises").toBeVisible();
    }
}
