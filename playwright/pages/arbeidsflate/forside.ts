import { expect, Locator, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Cookiebanner } from "../felles/cookiebanner";
import { Meny } from "../felles/meny";
import { assertFlateUtlogget } from "../felles/utlogget";

export class ArbeidsflateForside {
    // Utkast-lenken i sidemenyen finnes bare på innboksen, og href-en er den
    // samme uansett språk.
    readonly utkastLink: Locator;

    constructor(
        private page: Page,
        readonly url: string,
        readonly meny = new Meny(page),
        readonly cookiebanner = new Cookiebanner(page),
    ) {
        this.utkastLink = page.getByRole("complementary").locator("a[href=\"/drafts\"]");
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

        await expect(this.utkastLink, "Innboksens sidemeny vises").toBeVisible();
    }

    /**
     * At minst én dialog med den gitte tittelen vises i innboksen. Hver
     * dialog rendres som en lenke med tittelen som tekst. `.first()` siden en
     * app-instans sin tittel er satt av appen selv og ikke unik per instans —
     * gjentatte testkjøringer kan derfor ha lagt igjen flere instanser med
     * samme tittel, uten at det betyr noe galt.
     */
    async assertDialogVisible(tittel: string) {
        await expect(
            this.page.getByRole("link", { name: tittel }).first(),
            `Dialogen "${tittel}" vises i innboksen`
        ).toBeVisible();
    }
}
