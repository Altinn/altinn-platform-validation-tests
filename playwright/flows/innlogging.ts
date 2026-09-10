import { expect, Page, test } from "@playwright/test";
import { Sprak } from "../config/sprak";
import { TestUser } from "../config/testdata";
import { IdportenInnlogging } from "../pages/felles/idporten-innlogging";
import { Meny } from "../pages/felles/meny";
import { SyntetiskInnlogging } from "../pages/felles/syntetisk-innlogging";
import { REDIRECT_TIMEOUT } from "../pages/felles/navigasjon";
import { Side } from "../pages/side";
import { gjeldendeMiljo } from "../miljo";

/**
 * Innlogging går på tvers av alle flatene, og ligger derfor her framfor i et av
 * områdene.
 */
export class Innlogging {
  private meny: Meny;
  private idporten: IdportenInnlogging;
  private syntetisk: SyntetiskInnlogging;

  constructor(private page: Page) {
    this.meny = new Meny(page);
    this.idporten = new IdportenInnlogging(page);
    this.syntetisk = new SyntetiskInnlogging(page);
  }

  /**
   * Standardinnlogging: ID-porten med TestID i testmiljøene, Mockporten i prod.
   * Navigerer tilbake til ønsket side etter innlogging, også når infoportalen
   * sender brukeren til arbeidsflaten.
   */
  async logIn(side: Side, user: TestUser) {
    if (gjeldendeMiljo() === "prod") {
      await this.viaMockporten(side, user);
      return;
    }

    await side.navigateTo();
    await this.viaIdporten(user);
    await side.navigateTo();
  }

  /**
   * Eksplisitt Mockporten-innlogging for mekanismens egen test og for prod.
   */
  async viaMockporten(side: Side, user: TestUser) {
    await test.step("Innlogging med Mockporten", async () => {
      await this.syntetisk.login(side.url, user);
    });
  }

  async viaIdporten(user: TestUser) {
    if (gjeldendeMiljo() === "prod") {
      throw new Error("TestID er ikke tilgjengelig i prod. Bruk logIn().");
    }

    await test.step("Innlogging med TestID", async () => {
      // Navigeringen kan fortsatt være på vei gjennom Altinns authorize-endepunkt.
      await expect.poll(
        async () => this.page.url().includes("idporten") || await this.meny.isLoginButtonVisible(),
        { message: "ID-porten eller innloggingsknappen er klar", timeout: REDIRECT_TIMEOUT },
      ).toBe(true);

      if (!this.page.url().includes("idporten")) {
        await this.meny.clickLoginButton();
      }
      await this.idporten.login(user);
      await this.meny.lukkAktorvelger();
    });
  }

  /**
   * Logger inn fra flaten brukeren står på, og lander på `landing`. I testmiljøene
   * går det gjennom ID-porten med TestID; i prod brukes Mockporten.
   */
  async viaInnloggingsflyten(landing: Side, user: TestUser) {
    if (gjeldendeMiljo() === "prod") {
      await this.viaMockporten(landing, user);
      return;
    }

    await this.viaIdporten(user);
  }

  /**
   * Logger ut fra flaten brukeren står på. Utloggingen er felles for flatene, på
   * samme måte som innloggingen.
   */
  async logOut() {
    const startUrl = this.page.url();
    // Fullfør navigasjonen til innloggingsleverandøren før testen åpner en flate igjen.
    await Promise.all([
      this.page.waitForURL((url) => url.href !== startUrl, {
        waitUntil: "load",
        timeout: REDIRECT_TIMEOUT,
      }),
      this.meny.clickLogoutButton(),
    ]);
  }

  async assertOnIdportenLogin() {
    await this.idporten.assertOnPage();
  }

  async setLanguage(sprak: Sprak) {
    await this.meny.setLanguage(sprak);
  }

  async refresh() {
    await this.page.reload();
  }
}
