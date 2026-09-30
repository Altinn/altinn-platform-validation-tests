import { expect, Page } from "@playwright/test";

import { Sprak } from "../../config/sprak";

export class Meny {

    constructor(private page: Page) { }

    /**
     * Venter på at knappen er aktivert og ikke bare synlig. Headeren rendrer den
     * `disabled` mens den henter det den trenger, og `click()` blokkerer da uten
     * egen timeout til testen har brukt opp tiden sin. Det har skjedd, se
     * `helpers/junitparser/example-junit-report.xml`.
     *
     * Klikket prøves på nytt til menyen er åpen. Infoportalen rendrer knappen før
     * siden er hydrert, og et klikk før det åpner ingenting.
     */
    async clickMenuButton() {
        await expect(
            this.menuButton(),
            "Menyknappen i hovednavigasjonen er klar"
        ).toBeEnabled({ timeout: 15_000 });

        await expect(async () => {
            await this.menuButton().click();
            await expect(this.page.getByRole("menuitem").first()).toBeVisible({ timeout: 2_000 });
        }, "Menyen åpner seg").toPass({ timeout: 15_000 });
    }

    // "Altinn"-logoen i headeren går til infoportalens forside på alle flatene.
    async gaTilForsiden() {
        await this.page.getByRole("link", { name: "Altinn", exact: true }).click();
    }

    async gaTilInnboks() {
        await this.clickMenuButton();
        await this.page.getByRole("menuitem", { name: /^(innboks|inbox)$/i }).click();
    }

    async gaTilProfil() {
        await this.clickMenuButton();
        await this.page.getByRole("menuitem", { name: /^(din profil|your profile)$/i }).click();
    }

    async gaTilTilgangsstyring() {
        await this.clickMenuButton();
        await this.page.getByRole("menuitem", { name: /^(tilgangsstyring|access management)$/i }).click();
    }

    /**
     * Menyknappen i hovednavigasjonen finnes bare når brukeren er innlogget;
     * utlogget står det "Logg inn" der i stedet. Sjekker at den er aktivert, slik at
     * innlogget betyr en header som er til å bruke og ikke bare en som er rendret.
     */
    async assertLoggedIn() {
        await expect(
            this.menuButton(),
            "Menyknappen i hovednavigasjonen er klar"
        ).toBeEnabled({ timeout: 15_000 });
    }

    private menuButton() {
        return this.page.getByRole("banner").getByRole("button", {
            name: /^(meny|menu)$/i,
        });
    }

    async setLanguage(language: Sprak) {
        await this.clickMenuButton();
        await this.page
            .getByRole("menuitem", { name: "Språk/language" })
            .click();

        // Sprakvalgene har ikke lenger id-er, så de velges på rollen sin.
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
