import { test } from "../../fixtures/test";

test("Bruker er innlogget på alle flater etter innlogging via arbeidsflate", { tag: ["@at23", "@tt02", "@prod"] }, async ({
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
    });

    await test.step("Bruker er innlogget på profilen", async () => {
        await arbeidsflate.meny.gaTilProfil();
        await arbeidsflateProfil.assertLoggedIn();
    });

    await test.step("Bruker er innlogget på tilgangsstyring", async () => {
        await arbeidsflateProfil.meny.gaTilTilgangsstyring();
        await tilgangsstyring.assertLoggedIn();
    });

    await test.step("Bruker er innlogget på forsiden", async () => {
        await tilgangsstyring.meny.gaTilForsiden();
        await infoportal.assertLoggedIn(user);
    });
});

test("Bruker er innlogget på alle flater etter innlogging via tilgangsstyring", { tag: ["@at23", "@tt02", "@prod"] }, async ({
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
    });

    await test.step("Bruker er innlogget på profilen", async () => {
        await tilgangsstyring.meny.gaTilProfil();
        await arbeidsflateProfil.assertLoggedIn();
    });

    await test.step("Bruker er innlogget på arbeidsflate", async () => {
        await arbeidsflateProfil.meny.gaTilInnboks();
        await arbeidsflate.assertLoggedIn();
    });

    await test.step("Bruker er innlogget på forsiden", async () => {
        await arbeidsflate.meny.gaTilForsiden();
        await infoportal.assertLoggedIn(user);
    });
});
