import { expect, Page } from "@playwright/test";
import { baseUrls } from "../../config/environment";
import { TestUser } from "../../config/testdata";
import { Meny } from "../felles/meny";
import { gaaTil } from "../felles/navigasjon";
import { assertFlateUtlogget } from "../felles/utlogget";
import { Side } from "../side";

export class ArbeidsflateForside implements Side {
  readonly url = baseUrls.arbeidsflate;

  constructor(
    private page: Page,
    private meny = new Meny(page),
  ) {}

  async navigateTo() {
    await gaaTil(this.page, this.url);
  }

  async assertLoggedOut(user: TestUser) {
    await assertFlateUtlogget(this.page, user);
  }

  async assertLoggedIn() {
    await this.meny.assertLoggedIn();

    await expect(
      this.page.getByRole("complementary").locator('a[href="/drafts"]'),
      "Innboksens sidemeny vises",
    ).toBeVisible();
  }
}
