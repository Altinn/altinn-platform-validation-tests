import { test } from "../../fixtures/test";

// Endrer ingen data. Utloggingen går gjennom authentication /logout, som sender
// brukeren videre til /logout/handleloggedout, og det er de to endepunktene testene
// er her for. Sesjonen gjelder på tvers av flatene, så en utlogging fra én av dem
// skal ta brukeren ut av alle. Infoportalen sjekkes, men logges ikke ut fra: den har
// ikke hovednavigasjonen utloggingen ligger i.

test("Bruker er utlogget på alle flater etter utlogging fra arbeidsflate", { tag: ["@at23", "@tt02", "@prod"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step("Bruker logger inn via arbeidsflate", async () => {
        await innlogging.logInViaArbeidsflate(user);
        await arbeidsflate.assertLoggedIn();
    });

    await test.step("Bruker logger ut", async () => {
        await innlogging.logOut();
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

test("Bruker er utlogget på alle flater etter utlogging fra profilen", { tag: ["@at23", "@tt02", "@prod"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step("Bruker logger inn via arbeidsflate og går til profilen", async () => {
        await innlogging.logInViaArbeidsflate(user);
        await arbeidsflate.assertLoggedIn();

        await arbeidsflate.meny.gaTilProfil();
        await arbeidsflateProfil.assertLoggedIn();
    });

    await test.step("Bruker logger ut", async () => {
        await innlogging.logOut();
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

test("Bruker er utlogget på alle flater etter utlogging fra tilgangsstyring", { tag: ["@at23", "@tt02", "@prod"] }, async ({
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
        await innlogging.logOut();
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
