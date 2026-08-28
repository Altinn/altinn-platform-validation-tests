import { expect, Page } from "@playwright/test";
import { baseUrls, TestUser } from "../../config/environment";
import { Meny } from "../felles/meny";
import { gaaTil, erPaaSiden } from "../felles/navigasjon";
import { assertFlateUtlogget } from "../felles/utlogget";
import { Side } from "../side";

export class ArbeidsflateForside implements Side {
    readonly url = baseUrls.arbeidsflate;

    constructor(private page: Page, private meny = new Meny(page)) { }

    async navigateTo() {
        await gaaTil(this.page, this.url);
    }

    // Flatene bak innlogging svarer likt for en utlogget bruker, så påstanden
    // ligger i `assertFlateUtlogget`.
    async assertLoggedOut(user: TestUser) {
        await assertFlateUtlogget(this.page, user);
    }

    async assertLoggedIn() {
        await expect(this.page, 'Er på arbeidsflate forside').toHaveURL(erPaaSiden(this.url));
        await this.meny.assertLoggedIn();

        // Utkast-lenken i sidemenyen finnes bare på innboksen, og href-en er den
        // samme uansett språk.
        await expect(
            this.page.getByRole('complementary').locator('a[href="/drafts"]'),
            'Innboksens sidemeny vises'
        ).toBeVisible();
    }
}
