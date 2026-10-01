import { expect, Locator, Page } from "@playwright/test";

import { Sprak } from "../../config/sprak";

export class Meny {
    readonly menuButton: Locator;
    readonly menuItems: Locator;

    // "Altinn"-logoen i headeren går til infoportalens forside på alle flatene.
    readonly altinnLink: Locator;

    readonly innboksMenuItem: Locator;
    readonly profilMenuItem: Locator;
    readonly tilgangsstyringMenuItem: Locator;
    readonly languageMenuItem: Locator;

    constructor(private page: Page) {
        this.menuButton = page.getByRole("button", { name: /^(meny|menu)$/i });
        this.menuItems = page.getByRole("menuitem");

        this.altinnLink = page.getByRole("link", { name: "Altinn", exact: true });

        // Hele navnet på et av språkene, uavhengig av store og små bokstaver.
        const menuItem = (...navn: string[]) =>
            page.getByRole("menuitem", { name: new RegExp(`^(${navn.join("|")})$`, "i") });
        this.innboksMenuItem = menuItem("innboks", "inbox");
        this.profilMenuItem = menuItem("din profil", "your profile");
        this.tilgangsstyringMenuItem = menuItem("tilgangsstyring", "access management");
        this.languageMenuItem = menuItem("språk/language");
    }

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
            this.menuButton,
            "Menyknappen i hovednavigasjonen er klar"
        ).toBeEnabled({ timeout: 15_000 });

        await expect(async () => {
            await this.menuButton.click();
            await expect(this.menuItems.first()).toBeVisible({ timeout: 2_000 });
        }, "Menyen åpner seg").toPass({ timeout: 15_000 });
    }

    async gaTilForsiden() {
        await this.altinnLink.click();
    }

    async gaTilInnboks() {
        await this.clickMenuButton();
        await this.innboksMenuItem.click();
    }

    async gaTilProfil() {
        await this.clickMenuButton();
        await this.profilMenuItem.click();
    }

    async gaTilTilgangsstyring() {
        await this.clickMenuButton();
        await this.tilgangsstyringMenuItem.click();
    }

    /**
     * Menyknappen i hovednavigasjonen finnes bare når brukeren er innlogget;
     * utlogget står det "Logg inn" der i stedet. Sjekker at den er aktivert, slik at
     * innlogget betyr en header som er til å bruke og ikke bare en som er rendret.
     */
    async assertLoggedIn() {
        await expect(
            this.menuButton,
            "Menyknappen i hovednavigasjonen er klar"
        ).toBeEnabled({ timeout: 15_000 });
    }

    async setLanguage(language: Sprak) {
        await this.clickMenuButton();
        await this.languageMenuItem.click();

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
