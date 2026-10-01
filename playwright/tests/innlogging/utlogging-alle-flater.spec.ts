import { test } from "../../fixtures/test";

// Endrer ingen data. Utloggingen går via /logout og tilbake til
// /logout/handleloggedout, og det er de endepunktene testene er her for. Sesjonen
// gjelder på tvers av flatene, så en utlogging fra én av dem skal ta brukeren ut av
// alle. Infoportalen sjekkes, men logges ikke ut fra: den har ikke menyen
// utloggingen ligger i.
//
// Ikke i prod: der logger testene inn via Mockporten, og utloggingen derfra lander
// på en feilside.

// Skrudd av til arbeidsflaten logger ut ordentlig: den kan vise brukeren som
// innlogget etter utlogging. https://github.com/Altinn/dialogporten-frontend/issues/4683
test.fixme("Bruker er utlogget på alle flater etter utlogging fra arbeidsflate", { tag: ["@at23", "@tt02"] }, async ({
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

// Skrudd av til arbeidsflaten logger ut ordentlig: den kan vise brukeren som
// innlogget etter utlogging. https://github.com/Altinn/dialogporten-frontend/issues/4683
test.fixme("Bruker er utlogget på alle flater etter utlogging fra profilen", { tag: ["@at23", "@tt02"] }, async ({
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

test("Bruker er utlogget på alle flater etter utlogging fra tilgangsstyring", { tag: ["@at23", "@tt02"] }, async ({
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
