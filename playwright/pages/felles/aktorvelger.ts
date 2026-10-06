import { expect, Locator, Page } from "@playwright/test";

// Velgeren har søk når brukeren har flere aktører enn dette, undernivåene medregnet.
// Fra AccountSelector i @altinn/altinn-components.
const SOK_OVER_ANTALL_AKTORER = 5;

/**
 * Aktørvelgeren som åpner seg etter innlogging når brukeren kan representere flere
 * aktører. Etter mønster fra `selectActor` i access-management-frontend sine
 * Playwright-tester (playwright/pages/LoginPage.ts).
 */
export class Aktorvelger {
    readonly dialog: Locator;
    readonly searchBox: Locator;
    // Knappen i headeren med aktøren brukeren står på nå, ved siden av "Meny".
    readonly aktorKnapp: Locator;

    constructor(private page: Page) {
        this.dialog = page.getByRole("dialog");
        this.searchBox = this.dialog.getByRole("searchbox");
        this.aktorKnapp = page
            .getByRole("banner")
            .getByRole("button")
            .filter({ hasNotText: /^(meny|menu)$/i });
    }

    /**
     * Åpner aktørvelgeren fra headeren og velger `navn`, også når det er aktøren
     * brukeren allerede står på. Etter innlogging står brukeren ikke nødvendigvis på
     * seg selv, for eksempel når andre har gitt brukeren fullmakt.
     *
     * Klikket prøves på nytt til velgeren er åpen. Etter et språkbytte tegnes headeren
     * på nytt, og et klikk før den er klar åpner ingenting.
     */
    async velgAktorFraHeader(navn: string, antallAktorer: number) {
        await expect(async () => {
            await this.aktorKnapp.click();
            await expect(this.dialog).toBeVisible({ timeout: 2_000 });
        }, "Aktørvelgeren åpner seg").toPass({ timeout: 15_000 });
        await this.velgAktor(navn, antallAktorer);
        await expect(this.aktorKnapp, `Står på ${navn}`).toContainText(navn, { ignoreCase: true });
    }

    /**
     * Velger aktøren med dette navnet. Navnet skrives med store bokstaver i lista, og
     * menypunktet har med fødselsdato eller org.nr, så det matches uten store og små
     * bokstaver og uten å kreve hele navnet.
     */
    async velgAktor(navn: string, antallAktorer: number) {
        await expect(this.dialog, "Aktørvelgeren vises").toBeVisible();

        if (antallAktorer > SOK_OVER_ANTALL_AKTORER) {
            await this.searchBox.fill(navn);
        }

        const escaped = navn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        await this.dialog
            .getByRole("menuitem", { name: new RegExp(escaped, "i") })
            .first()
            .click();
        await expect(this.dialog, "Aktørvelgeren lukkes etter valget").toBeHidden();
    }
}
