import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

import type { TestUser } from "../../config/environment";
import { alleSprak } from "../../config/sprak";
import { test } from "../../fixtures/test";
import { gjeldendeMiljo, runInEnvironment } from "../../miljo";
import { Seksjon } from "../../pages/tilgangsstyring/seksjoner";

runInEnvironment("prod", "at23", "tt02");

// Testpersonene, én rad per worker.
const testdata = path.join(__dirname, "../../testdata/dagligLeder", `${gjeldendeMiljo()}.csv`);

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
        }, testInfo) => {
            const brukere = parse(fs.readFileSync(testdata), { columns: true, skip_empty_lines: true }) as TestUser[];
            const dagligLeder = brukere[testInfo.parallelIndex];

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
