import { test } from "../../fixtures/test";

// Arbeidsflaten har banneret skrudd av i tt02, og tilgangsstyring mangler det i prod.

test("Cookiebanneret vises på arbeidsflate for en ny sesjon", { tag: ["@at23", "@prod"] }, async ({
    innlogging,
    user,
    arbeidsflate,
}) => {
    await innlogging.logIn(arbeidsflate, user);
    await arbeidsflate.assertLoggedIn();
    await arbeidsflate.cookiebanner.assertVisible();
});

test("Cookiebanneret vises på profilen for en ny sesjon", { tag: ["@at23", "@prod"] }, async ({
    innlogging,
    user,
    arbeidsflateProfil,
}) => {
    await innlogging.logIn(arbeidsflateProfil, user);
    await arbeidsflateProfil.assertLoggedIn();
    await arbeidsflateProfil.cookiebanner.assertVisible();
});

test("Cookiebanneret vises på tilgangsstyring for en ny sesjon", { tag: ["@at23", "@tt02"] }, async ({
    innlogging,
    user,
    tilgangsstyring,
}) => {
    await innlogging.logIn(tilgangsstyring, user);
    await tilgangsstyring.assertLoggedIn();
    await tilgangsstyring.cookiebanner.assertVisible();
});

test("Cookiebanneret vises på infoportalen for en ny sesjon", { tag: ["@at23", "@tt02", "@prod"] }, async ({
    infoportal,
}) => {
    await infoportal.navigateTo();
    await infoportal.cookiebanner.assertVisible();
});
