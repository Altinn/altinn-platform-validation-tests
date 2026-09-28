import { test } from "../../fixtures/test";

// Bare at23, siden banneret ikke er rullet ut i tt02 ennå.
test("Cookievalg fra infoportalen tas hensyn til i arbeidsflate, profil og tilgangsstyring", { tag: ["@at23"] }, async ({
    innlogging,
    user,
    arbeidsflate,
    arbeidsflateProfil,
    tilgangsstyring,
    infoportal,
    cookiebanner,
}) => {
    await test.step("Bruker avslår informasjonskapsler i infoportalen", async () => {
        await infoportal.navigateTo();
        await cookiebanner.avsla();
    });

    await test.step("Banneret vises ikke igjen på arbeidsflate", async () => {
        await innlogging.logIn(arbeidsflate, user);
        // Flaten må være kommet opp først. Banneret rendres tidlig, så "vises ikke"
        // er sant også på en tom side.
        await arbeidsflate.assertLoggedIn();
        await cookiebanner.assertHidden();
    });

    await test.step("Banneret vises ikke igjen på profilen", async () => {
        await arbeidsflateProfil.navigateTo();
        await arbeidsflateProfil.assertLoggedIn();
        await cookiebanner.assertHidden();
    });

    await test.step("Banneret vises ikke igjen på tilgangsstyring", async () => {
        await tilgangsstyring.navigateTo();
        await tilgangsstyring.assertLoggedIn();
        await cookiebanner.assertHidden();
    });
});
