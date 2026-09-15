import { expect, Page } from "@playwright/test";
import { baseUrls } from "../../config/environment";
import { TestUser } from "../../config/testdata";
import { Sprak } from "../../config/sprak";
import { gaaTil, REDIRECT_TIMEOUT } from "../felles/navigasjon";
import { Side } from "../side";

export class InfoportalForside implements Side {
  readonly url = baseUrls.infoportal;

  constructor(private page: Page) {}

  async navigateTo() {
    await gaaTil(this.page, this.url, 15_000);
  }

  async assertLoggedIn(user: TestUser) {
    await this.assertOnPage();
    await expect(
      this.page.getByText(user.name).first(),
      "Brukeren er innlogget på infoportalen",
    ).toBeVisible();
  }

  async assertLoggedOut(user: TestUser) {
    await this.assertOnPage();

    await expect(
      this.page.getByRole("button", { name: /logg inn|login/i }).first(),
      "Innloggingsknappen vises på infoportalen",
    ).toBeVisible({ timeout: REDIRECT_TIMEOUT });

    await expect(
      this.page.getByText(user.name).first(),
      "Brukeren er ikke innlogget på infoportalen",
    ).toBeHidden();
  }

  async assertOnPage() {
    await expect(this.page, "Er på infoportalen").toHaveURL(
      (url) => url.origin === new URL(this.url).origin,
    );

    await expect(
      this.page.getByRole("main"),
      "Infoportalen har rendret innholdet",
    ).toBeVisible();
  }

  async assertSprak(sprak: Sprak) {
    await this.assertOnPage();
    await expect(
      this.page.getByText(sporsmaal[sprak]),
      `Infoportalen viser "${sporsmaal[sprak]}"`,
    ).toBeVisible();
  }
}

const sporsmaal: Record<Sprak, RegExp> = {
  [Sprak.Bokmaal]: /^hva vil du gjøre\?$/i,
  [Sprak.Nynorsk]: /^kva vil du gjere\?$/i,
  [Sprak.Engelsk]: /^what do you want to do\?$/i,
};
