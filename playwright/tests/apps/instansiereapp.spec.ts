import { Sprak } from "../../config/sprak";
import { expect, test } from "../../fixtures/test";

// Pakkenavnet oversettes også, ikke bare UI-teksten rundt, se brukere.ts.
const FRITIDSAKTIVITETER_OG_FRILUFTSLIV: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Fritidsaktiviteter og friluftsliv",
    [Sprak.Nynorsk]: "Fritidsaktivitetar og friluftsliv",
    [Sprak.Engelsk]: "Leisure activities and outdoor life",
};

test("Bruker instansierer app", { tag: ["@at23"] }, async ({
    innlogging,
    page,
    user, arbeidsflate,
    brukere,
    tilgangsstyring,
    sprak,
}) => {
    await test.step("Privatperson direkte navigerer til appen", async () => {
        await page.goto("https://ttd.apps.at23.altinn.cloud/ttd/brukermonster-test-app/");
        await innlogging.loggInnMedTestId(user);

    });

    await test.step("Verifisere bruker får instansiert appen", async () => {
        await expect(page.getByTestId("presentation-heading")).toContainText("brukermonster-test-app");
        await expect(page.locator("#main-content")).toContainText("Testdepartementet");
        await page.getByRole("link", { name: "Tilbake til innboks" }).click();

    });

    await test.step("Delegere tilgangspakke til person-B", async () => {
        await arbeidsflate.meny.gaTilTilgangsstyring();
        await tilgangsstyring.meny.setLanguage(sprak);
        await tilgangsstyring.brukereLink.click();
        await brukere.leggTilNyBruker("07885798378", "KORGSTOL");

        const tilgangspakke = FRITIDSAKTIVITETER_OG_FRILUFTSLIV[sprak];
        await brukere.giFullmaktForTilgangspakke("Storartet Korgstol", tilgangspakke);
        await brukere.assertHarTilgangspakke("Storartet Korgstol", tilgangspakke);
        await brukere.assertTilgangspakkeInneholderApp("Storartet Korgstol", tilgangspakke, "Bruksmønster-test");
    });
});
