import { test } from "../../fixtures/test";

// mockporten støtter per nå ikke utlogging (på en god måte)
// Ikke i tt02 inntil videre: arbeidsflaten kan vise brukeren som innlogget etter
// utlogging, se https://github.com/Altinn/dialogporten-frontend/issues/4683
test("Bruker er utlogget på alle flater etter utlogging fra arbeidsflate", { tag: ["@at23"] }, async ({
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

    await test.step("Bruker logger ut", async () => {
        await innlogging.loggUt();
    });

    await test.step("Ingen av flatene viser brukeren som innlogget", async () => {
        await arbeidsflate.navigateTo();
        await arbeidsflate.assertLoggedOut(user);

        await arbeidsflateProfil.navigateTo();
        await arbeidsflateProfil.assertLoggedOut(user);

        await tilgangsstyring.navigateTo();
        await tilgangsstyring.assertLoggedOut(user);

        await infoportal.navigateTo();
        await infoportal.assertLoggedOut(user);
    });
});

test("Bruker er utlogget på alle flater etter utlogging fra profilen", { tag: ["@at23"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step("Bruker logger inn via arbeidsflate og går til profilen", async () => {
        await innlogging.loggInnViaArbeidsflate(user);
        await arbeidsflate.assertLoggedIn();

        await arbeidsflate.meny.gaTilProfil();
        await arbeidsflateProfil.assertLoggedIn();
    });

    await test.step("Bruker logger ut", async () => {
        await innlogging.loggUt();
    });

    await test.step("Ingen av flatene viser brukeren som innlogget", async () => {
        await arbeidsflate.navigateTo();
        await arbeidsflate.assertLoggedOut(user);

        await arbeidsflateProfil.navigateTo();
        await arbeidsflateProfil.assertLoggedOut(user);

        await tilgangsstyring.navigateTo();
        await tilgangsstyring.assertLoggedOut(user);

        await infoportal.navigateTo();
        await infoportal.assertLoggedOut(user);
    });
});

test("Bruker er utlogget på alle flater etter utlogging fra tilgangsstyring", { tag: ["@at23"] }, async ({
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

    await test.step("Bruker logger ut", async () => {
        await innlogging.loggUt();
    });

    await test.step("Ingen av flatene viser brukeren som innlogget", async () => {
        await arbeidsflate.navigateTo();
        await arbeidsflate.assertLoggedOut(user);

        await arbeidsflateProfil.navigateTo();
        await arbeidsflateProfil.assertLoggedOut(user);

        await tilgangsstyring.navigateTo();
        await tilgangsstyring.assertLoggedOut(user);

        await infoportal.navigateTo();
        await infoportal.assertLoggedOut(user);
    });
});
