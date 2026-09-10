import { test } from "../../fixtures/test";
import { alleSprak } from "../../config/sprak";
import { Seksjon } from "../../pages/tilgangsstyring/seksjoner";
import { runInEnvironment } from "../../miljo";

runInEnvironment("prod", "at23", "tt02");
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
  test.describe(`Tilgangsstyring på ${valgtSprak}`, () => {
    test.use({ sprak: valgtSprak, testbrukerPath: "dagligLeder" });

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

      await test.step("Ser seksjonene hun har som seg selv, ikke som virksomheten", async () => {
        await tilgangsstyring.forside.assertSections(forventedeSeksjoner);
      });
    });
  });
}
