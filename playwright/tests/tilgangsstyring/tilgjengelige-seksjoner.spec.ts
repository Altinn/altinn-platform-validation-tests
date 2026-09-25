import type { TestUser } from "../../config/environment";
import { alleSprak } from "../../config/sprak";
import { readCsv } from "../../config/testdata";
import { test } from "../../fixtures/test";
import { gjeldendeMiljo, runInEnvironment } from "../../miljo";
import { Seksjon } from "../../pages/tilgangsstyring/seksjoner";

runInEnvironment("prod", "at23", "tt02");

// Testpersonene, én rad per worker.
let dagligLeder: TestUser;

test.beforeAll(({}, testInfo) => {
    dagligLeder = readCsv<TestUser>(`dagligLeder/${gjeldendeMiljo()}.csv`)[testInfo.parallelIndex];
});

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
    test.describe(`Tilgangsstyring på ${valgtSprak}`, () => {
        test.use({ sprak: valgtSprak });

        test("Bruker ser oversikt over navigasjonsvalg", async ({
            innlogging,
            tilgangsstyring,
        }) => {

            await test.step("Innlogget bruker åpner tilgangsstyring", async () => {
                await innlogging.logIn(tilgangsstyring.forside, dagligLeder);
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
