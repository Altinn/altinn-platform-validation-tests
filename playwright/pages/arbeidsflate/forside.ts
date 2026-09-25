import { expect, Page } from "@playwright/test";

import { TestUser } from "../../config/testdata";
import { Meny } from "../felles/meny";
import { gaaTil, ventPaaIdporten } from "../felles/navigasjon";
import { assertFlateUtlogget } from "../felles/utlogget";
import { Side } from "../side";

export class ArbeidsflateForside implements Side {
    constructor(
        private page: Page,
        readonly url: string,
        private meny = new Meny(page),
    ) {}

    async navigateTo() {
        await gaaTil(this.page, this.url);
    }

    async startInnlogging() {
        await ventPaaIdporten(this.page);
    }

    async assertLoggedOut(user: TestUser) {
        await assertFlateUtlogget(this.page, user);
    }

    async assertLoggedIn() {
        await this.meny.assertLoggedIn();

        await expect(
            this.page.getByRole("complementary").locator("a[href=\"/drafts\"]"),
            "Innboksens sidemeny vises",
        ).toBeVisible();
    }
}
