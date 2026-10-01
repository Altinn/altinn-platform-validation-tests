import { test } from "../../fixtures/test";

// Språket kommer fra projectet, så testen kjører én gang per språk.
test("Brukerens språkvalg fra profilen vises i infoportalen", { tag: ["@at23", "@tt02"] }, async ({
    innlogging,
    user,
    sprak,
    tilgangsstyring,
    infoportal,
}) => {
    await test.step(`Bruker logger inn og setter språk til ${sprak}`, async () => {
        await innlogging.loggInnViaTilgangsstyring(user);
        await tilgangsstyring.assertLoggedIn();
        await tilgangsstyring.meny.setLanguage(sprak);
    });

    await test.step("Bruker navigerer til infoportalen", async () => {
        await infoportal.navigateTo();
    });

    await test.step(`Infoportalen viser innhold på ${sprak}`, async () => {
        await infoportal.assertSprak(sprak);
    });
});
