import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

import type { TestUser } from "../../config/environment";
import { Flate, testMedFlater as test } from "../../fixtures/test";
import { gjeldendeMiljo, runInEnvironment } from "../../miljo";

// Verifisert i prod, og endrer ingen data. Innloggingen skjer med logIn, altså uten
// ID-porten-skjermbildene, som ikke finnes i prod.
runInEnvironment("at23", "tt02", "prod");

// Testpersonene, én rad per worker.
const testdata = path.join(__dirname, "../../testdata/privatPersonUtenVirksomhet", `${gjeldendeMiljo()}.csv`);

const flater: Flate[] = [
    "arbeidsflate",
    "arbeidsflate-profil",
    "tilgangsstyring",
    "infoportalen",
];

for (const start of flater) {
    // Det testen verifiserer er at sesjonen gjelder på tvers av flatene og tåler refresh.
    test(`Bruker forblir innlogget på alle flater etter innlogging fra ${start}`, async ({
        innlogging,
        flater: sider,
    }, testInfo) => {
        const brukere = parse(fs.readFileSync(testdata), { columns: true, skip_empty_lines: true }) as TestUser[];
        const privatPerson = brukere[testInfo.parallelIndex];

        await test.step(`Bruker logger inn og lander på ${start}`, async () => {
            await innlogging.logIn(sider[start], privatPerson);
            await sider[start].assertLoggedIn(privatPerson);
        });

        await test.step("Bruker er innlogget på de andre flatene, også etter refresh", async () => {
            for (const flate of flater.filter((f) => f !== start)) {
                await sider[flate].navigateTo();
                await sider[flate].assertLoggedIn(privatPerson);

                await innlogging.refresh();
                await sider[flate].assertLoggedIn(privatPerson);
            }
        });
    });
}
