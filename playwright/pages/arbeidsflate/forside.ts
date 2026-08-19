import { expect, Page } from "@playwright/test";
import { baseUrls } from "../../config/environment";
import { Meny } from "../felles/meny";
import { Side } from "../side";

export class ArbeidsflateForside implements Side {
    readonly url = baseUrls.arbeidsflate;

    constructor(private page: Page, private meny = new Meny(page)) { }

    async navigateTo() {
        await this.page.goto(this.url);
    }

    async assertLoggedIn() {
        await expect(this.page, 'Er på arbeidsflate forside').toHaveURL(this.url);
        await this.meny.assertLoggedIn();

        // Utkast-lenken i sidemenyen finnes bare på innboksen, og href-en er den
        // samme uansett språk.
        await expect(
            this.page.getByRole('complementary').locator('a[href="/drafts"]'),
            'Innboksens sidemeny vises'
        ).toBeVisible();
    }
}
