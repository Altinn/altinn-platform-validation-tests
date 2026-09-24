import { alleSprak } from "../../config/sprak";
import { test } from "../../fixtures/test";
import { miljoer } from "../../miljo";
import { Seksjon } from "../../pages/tilgangsstyring/seksjoner";
import { Testbruker } from "../../testdata";

/**
 * Regelen for hva som vises ligger i useSidebarItems.tsx i altinn-access-management-frontend.
 */
const forventedeSeksjoner = [
    Seksjon.Foresporsler,
    Seksjon.Brukere,
    Seksjon.Fullmakter,
    Seksjon.FullmakterHosAndre,
    Seksjon.SamtykkeOgFullmaktsavtaler,
];

for (const valgtSprak of alleSprak) {
    test.describe(
        `Tilgangsstyring på ${valgtSprak}`,
        miljoer("prod", "at23", "tt02"),
        () => {
            test.use({ sprak: valgtSprak, testbrukerPath: Testbruker.DagligLeder });

            test("Daglig leder som representerer seg selv ser sine navigasjonsvalg", async ({
                innlogging,
                user,
                tilgangsstyring,
            }) => {
                await test.step("Daglig leder logger inn og representerer seg selv", async () => {
                    await innlogging.logIn(tilgangsstyring.forside, user);
                    await tilgangsstyring.forside.assertLoggedIn();
                });

                await test.step(`Setter språk til ${valgtSprak}`, async () => {
                    await innlogging.setLanguage(valgtSprak);
                });

                await test.step("Daglig leder ser seksjonene som gjelder ved representasjon av seg selv", async () => {
                    await tilgangsstyring.forside.assertSections(forventedeSeksjoner);
                });
            });
        },
    );
}
