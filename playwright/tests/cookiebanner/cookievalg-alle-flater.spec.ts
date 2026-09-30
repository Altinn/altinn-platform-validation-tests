import { test } from "../../fixtures/test";

// Hver test tar valget på én flate og sjekker at banneret er borte på de andre. Flatene
// må være kommet opp før "vises ikke" sjekkes, siden banneret rendres tidlig og "vises
// ikke" er sant også på en tom side.

test("Godtatt på arbeidsflate gjelder på alle flater", { tag: ["@at23", "@prod"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step("Bruker godtar informasjonskapsler på arbeidsflate", async () => {
        await innlogging.logInViaArbeidsflate(user);
        await arbeidsflate.cookiebanner.godta();
    });

    await test.step("Banneret vises ikke på de andre flatene", async () => {
        await arbeidsflateProfil.navigateTo();
        await arbeidsflateProfil.assertLoggedIn();
        await arbeidsflateProfil.cookiebanner.assertHidden();

        await tilgangsstyring.navigateTo();
        await tilgangsstyring.assertLoggedIn();
        await tilgangsstyring.cookiebanner.assertHidden();

        await infoportal.navigateTo();
        await infoportal.assertLoggedIn(user);
        await infoportal.cookiebanner.assertHidden();
    });
});

test("Avslått på profilen gjelder på alle flater", { tag: ["@at23", "@prod"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step("Bruker avslår informasjonskapsler på profilen", async () => {
        await innlogging.logInViaArbeidsflate(user);
        await arbeidsflate.meny.gaTilProfil();
        await arbeidsflateProfil.cookiebanner.avsla();
    });

    await test.step("Banneret vises ikke på de andre flatene", async () => {
        await arbeidsflate.navigateTo();
        await arbeidsflate.assertLoggedIn();
        await arbeidsflate.cookiebanner.assertHidden();

        await tilgangsstyring.navigateTo();
        await tilgangsstyring.assertLoggedIn();
        await tilgangsstyring.cookiebanner.assertHidden();

        await infoportal.navigateTo();
        await infoportal.assertLoggedIn(user);
        await infoportal.cookiebanner.assertHidden();
    });
});

test("Godtatt på tilgangsstyring gjelder på alle flater", { tag: ["@at23", "@tt02"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step("Bruker godtar informasjonskapsler på tilgangsstyring", async () => {
        await innlogging.logInViaTilgangsstyring(user);
        await tilgangsstyring.cookiebanner.godta();
    });

    await test.step("Banneret vises ikke på de andre flatene", async () => {
        await arbeidsflate.navigateTo();
        await arbeidsflate.assertLoggedIn();
        await arbeidsflate.cookiebanner.assertHidden();

        await arbeidsflateProfil.navigateTo();
        await arbeidsflateProfil.assertLoggedIn();
        await arbeidsflateProfil.cookiebanner.assertHidden();

        await infoportal.navigateTo();
        await infoportal.assertLoggedIn(user);
        await infoportal.cookiebanner.assertHidden();
    });
});

test("Avslått på infoportalen gjelder på alle flater", { tag: ["@at23", "@tt02", "@prod"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step("Bruker avslår informasjonskapsler på infoportalen før innlogging", async () => {
        await infoportal.navigateTo();
        await infoportal.cookiebanner.avsla();
    });

    await test.step("Banneret vises ikke på de andre flatene", async () => {
        await innlogging.logInViaArbeidsflate(user);
        await arbeidsflate.assertLoggedIn();
        await arbeidsflate.cookiebanner.assertHidden();

        await arbeidsflateProfil.navigateTo();
        await arbeidsflateProfil.assertLoggedIn();
        await arbeidsflateProfil.cookiebanner.assertHidden();

        await tilgangsstyring.navigateTo();
        await tilgangsstyring.assertLoggedIn();
        await tilgangsstyring.cookiebanner.assertHidden();
    });
});
