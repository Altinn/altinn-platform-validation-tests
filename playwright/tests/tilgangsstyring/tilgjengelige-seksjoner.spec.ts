import { test } from "../../fixtures/test";
import { alleSprak } from "../../config/sprak";
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

for (const valgtSprak of alleSprak) {
  // Merket for prod: verifisert der, og endrer ingen data.
  test.describe(`Tilgangsstyring på ${valgtSprak}`, { tag: "@prod" }, () => {
    test.use({ sprak: valgtSprak });

    test("Bruker ser oversikt over navigasjonsvalg", async ({
      innlogging,
      user,
      tilgangsstyring,
    }) => {
      await test.step("Innlogget bruker åpner tilgangsstyring", async () => {
        await innlogging.logIn(tilgangsstyring.forside, user);
        await tilgangsstyring.forside.assertLoggedIn();
      });

      await test.step(`Setter språk til ${valgtSprak}`, async () => {
        await innlogging.setLanguage(valgtSprak);
      });

      await test.step("Verifiser tilgjengelige seksjoner", async () => {
        await tilgangsstyring.forside.assertSections(forventedeSeksjoner);
      });
    });
  });
}
