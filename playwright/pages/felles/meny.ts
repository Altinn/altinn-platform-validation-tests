import { expect, Page } from "@playwright/test";
import { Sprak } from "../../config/sprak";
import { TestUser } from "../../config/testdata";
import { REDIRECT_TIMEOUT } from "./navigasjon";

export class Meny {
  constructor(private page: Page) {}

  async clickMenuButton() {
    await expect(
      this.menuButton(),
      "Menyknappen i hovednavigasjonen er klar",
    ).toBeEnabled({ timeout: 15_000 });

    await this.menuButton().click();
  }

  async assertLoggedIn() {
    await expect(
      this.menuButton(),
      "Menyknappen i hovednavigasjonen er klar",
    ).toBeEnabled({ timeout: 15_000 });
  }

  /**
   * Tilgangsstyring sender brukeren tilbake fra innloggingen på
   * ?openAccountMenu=true, som åpner aktørvelgeren. Menyknappen er disabled så
   * lenge velgeren står åpen, så en test må svare på den først. Å lukke den er
   * svaret: brukeren representerer seg selv fra før.
   *
   * Venter på at én av de to tilstandene inntreffer, siden velgeren åpner seg
   * et lite øyeblikk etter at flaten er tilbake, og ikke på alle flatene.
   */
  async lukkAktorvelger(user: TestUser) {
    await expect
      .poll(
        async () =>
          (await this.aktorvelger().isVisible()) ||
          (await this.menuButton().isEnabled()),
        {
          message: "Aktørvelgeren eller menyknappen er kommet",
          timeout: REDIRECT_TIMEOUT,
        },
      )
      .toBe(true);

    if (await this.aktorvelger().isVisible()) {
      await this.segSelv(user).click();
      await expect(this.aktorvelger(), "Aktørvelgeren er lukket").toBeHidden();
    }
  }

  /** Velger den innloggede testpersonen med navn, uavhengig av profilspråk. */
  private segSelv(user: TestUser) {
    return this.aktorvelger()
      .getByRole("menuitem")
      .filter({ has: this.page.getByText(user.name, { exact: true }) });
  }

  private aktorvelger() {
    return this.page.getByRole("dialog").filter({
      has: this.page.getByRole("heading", {
        name: /vegner av|vegne av|behalf of/i,
      }),
    });
  }

  private menuButton() {
    return this.page.getByRole("banner").getByRole("button", {
      name: /^(meny|menu)$/i,
    });
  }

  private loginButton() {
    return this.page.getByRole("button", { name: /logg inn|login/i });
  }

  async isLoginButtonVisible() {
    return this.loginButton().isVisible();
  }

  async clickLoginButton() {
    await this.loginButton().click();
  }

  async clickLogoutButton() {
    await this.clickMenuButton();

    const logoutButton = this.page
      .getByRole("button", {
        name: /^(logg ut|log out)$/i,
      })
      .first();

    await expect(logoutButton, "Logg ut ligger i menyen").toBeEnabled();
    await logoutButton.click();
  }

  async setLanguage(language: Sprak) {
    await this.clickMenuButton();
    await this.page.getByRole("menuitem", { name: "Språk/language" }).click();

    await this.page
      .getByRole("menuitemradio", { name: languageLabels[language] })
      .click();
  }
}

const languageLabels: Record<Sprak, string> = {
  [Sprak.Bokmaal]: "Norsk (bokmål)",
  [Sprak.Nynorsk]: "Norsk (nynorsk)",
  [Sprak.Engelsk]: "English",
};
