import { test } from "../../fixtures/test";
import { Seksjon } from "../../pages/tilgangsstyring/seksjoner";

// Hva denne brukeren skal se. En bruker med færre tilganger får sin egen liste,
// ikke en conditional i page objectet.
const forventedeSeksjoner = [
    Seksjon.Foresporsler,
    Seksjon.Brukere,
    Seksjon.Fullmakter,
    Seksjon.FullmakterHosAndre,
    Seksjon.SamtykkeOgFullmaktsavtaler,
];

// Står i spraktester i playwright.config.ts, så den kjører én gang per språk.
test("Bruker ser oversikt over navigasjonsvalg", { tag: ["@at23", "@tt02", "@prod"] }, async ({
    innlogging,
    user,
    sprak,
    tilgangsstyring,
}) => {
    await test.step("Innlogget bruker åpner tilgangsstyring", async () => {
        await innlogging.logIn(tilgangsstyring, user);
        await tilgangsstyring.assertLoggedIn();
    });

    await test.step(`Setter språk til ${sprak}`, async () => {
        await tilgangsstyring.meny.setLanguage(sprak);
    });

    await test.step("Verifiser tilgjengelige seksjoner", async () => {
        await tilgangsstyring.assertSections(forventedeSeksjoner);
    });
});
