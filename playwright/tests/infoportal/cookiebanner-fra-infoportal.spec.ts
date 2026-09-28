import { test } from "../../fixtures/test";

// Bare at23, siden banneret ikke er rullet ut i tt02 ennå.
test("Cookievalg fra infoportalen tas hensyn til i arbeidsflate, profil og tilgangsstyring", { tag: ["@at23"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step("Bruker avslår informasjonskapsler i infoportalen", async () => {
        await infoportal.navigateTo();
        await infoportal.cookiebanner.avsla();
    });

    await test.step("Banneret vises ikke igjen på arbeidsflate", async () => {
        await innlogging.logIn(arbeidsflate, user);
        // Flaten må være kommet opp først. Banneret rendres tidlig, så "vises ikke"
        // er sant også på en tom side.
        await arbeidsflate.assertLoggedIn();
        await arbeidsflate.cookiebanner.assertHidden();
    });

    await test.step("Banneret vises ikke igjen på profilen", async () => {
        await arbeidsflateProfil.navigateTo();
        await arbeidsflateProfil.assertLoggedIn();
        await arbeidsflateProfil.cookiebanner.assertHidden();
    });

    await test.step("Banneret vises ikke igjen på tilgangsstyring", async () => {
        await tilgangsstyring.navigateTo();
        await tilgangsstyring.assertLoggedIn();
        await tilgangsstyring.cookiebanner.assertHidden();
    });
});
