import { expect, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Cookiebanner } from "../felles/cookiebanner";
import { Meny } from "../felles/meny";
import { gaaTil } from "../felles/navigasjon";
import { assertFlateUtlogget } from "../felles/utlogget";

export class ArbeidsflateForside {
    constructor(
        private page: Page,
        readonly url: string,
        readonly meny = new Meny(page),
        readonly cookiebanner = new Cookiebanner(page),
    ) { }

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

        // Utkast-lenken i sidemenyen finnes bare på innboksen, og href-en er den
        // samme uansett språk.
        await expect(
            this.page.getByRole("complementary").locator("a[href=\"/drafts\"]"),
            "Innboksens sidemeny vises"
        ).toBeVisible();
    }
}
