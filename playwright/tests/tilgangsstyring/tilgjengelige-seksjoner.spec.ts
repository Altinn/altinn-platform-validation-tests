import { expect, test } from "../../fixtures/test";

// Seksjonene finnes på href, uavhengig av språk. Språkvalget testes i
// infoportal/sprak-fra-profil.spec.ts, og oversettelsene eies av tilgangsstyring.
test("Bruker ser oversikt over navigasjonsvalg", { tag: ["@at23", "@tt02", "@prod"] }, async ({
    innlogging,
    user,
    tilgangsstyring,
}) => {
    await test.step("Innlogget bruker åpner tilgangsstyring", async () => {
        await innlogging.loggInnViaTilgangsstyring(user);
        await tilgangsstyring.assertLoggedIn();
    });

    // En bruker med færre tilganger ser færre seksjoner, og får sin egen test.
    await test.step("Bruker ser seksjonene i sidemenyen", async () => {
        await expect(tilgangsstyring.foresporslerLink, "Forespørsler vises").toBeVisible();
        await expect(tilgangsstyring.brukereLink, "Brukere vises").toBeVisible();
        await expect(tilgangsstyring.fullmakterLink, "Fullmakter vises").toBeVisible();
        await expect(tilgangsstyring.fullmakterHosAndreLink, "Fullmakter hos andre vises").toBeVisible();
        await expect(tilgangsstyring.samtykkeOgFullmaktsavtalerLink, "Samtykke- og fullmaktsavtaler vises").toBeVisible();
    });
});
