import { test } from "../../fixtures/test";

// Verifisert i prod, og endrer ingen data. Det testene verifiserer er at sesjonen
// gjelder på tvers av flatene og tåler refresh.

test("Bruker forblir innlogget på alle flater etter innlogging via arbeidsflate", { tag: ["@at23", "@tt02", "@prod"] }, async ({
    page,
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step("Bruker logger inn via arbeidsflate", async () => {
        await innlogging.loggInnViaArbeidsflate(user);
        await arbeidsflate.assertLoggedIn();

        await page.reload();
        await arbeidsflate.assertLoggedIn();
    });

    await test.step("Bruker er innlogget på profilen, også etter refresh", async () => {
        await arbeidsflate.meny.gaTilProfil();
        await arbeidsflateProfil.assertLoggedIn();

        await page.reload();
        await arbeidsflateProfil.assertLoggedIn();
    });

    await test.step("Bruker er innlogget på tilgangsstyring, også etter refresh", async () => {
        await arbeidsflateProfil.meny.gaTilTilgangsstyring();
        await tilgangsstyring.assertLoggedIn();

        await page.reload();
        await tilgangsstyring.assertLoggedIn();
    });

    await test.step("Bruker er innlogget på forsiden, også etter refresh", async () => {
        await tilgangsstyring.meny.gaTilForsiden();
        await infoportal.assertLoggedIn(user);

        await page.reload();
        await infoportal.assertLoggedIn(user);
    });
});

test("Bruker forblir innlogget på alle flater etter innlogging via tilgangsstyring", { tag: ["@at23", "@tt02", "@prod"] }, async ({
    page,
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step("Bruker logger inn via tilgangsstyring", async () => {
        await innlogging.loggInnViaTilgangsstyring(user);
        await tilgangsstyring.assertLoggedIn();

        await page.reload();
        await tilgangsstyring.assertLoggedIn();
    });

    await test.step("Bruker er innlogget på profilen, også etter refresh", async () => {
        await tilgangsstyring.meny.gaTilProfil();
        await arbeidsflateProfil.assertLoggedIn();

        await page.reload();
        await arbeidsflateProfil.assertLoggedIn();
    });

    await test.step("Bruker er innlogget på arbeidsflate, også etter refresh", async () => {
        await arbeidsflateProfil.meny.gaTilInnboks();
        await arbeidsflate.assertLoggedIn();

        await page.reload();
        await arbeidsflate.assertLoggedIn();
    });

    await test.step("Bruker er innlogget på forsiden, også etter refresh", async () => {
        await arbeidsflate.meny.gaTilForsiden();
        await infoportal.assertLoggedIn(user);

        await page.reload();
        await infoportal.assertLoggedIn(user);
    });
});
