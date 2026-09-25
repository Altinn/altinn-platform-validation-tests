import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

import type { TestUser } from "../../config/environment";
import { Flate, testMedFlater as test } from "../../fixtures/test";
import { gjeldendeMiljo, runInEnvironment } from "../../miljo";

// Endrer ingen data. I prod går innloggingen via mockporten, siden
// TestID-skjermbildene bare finnes i testmiljøene.
runInEnvironment("at23", "tt02", "prod");

// Testpersonene, én rad per worker.
const testdata = path.join(__dirname, "../../testdata/privatPersonUtenVirksomhet", `${gjeldendeMiljo()}.csv`);

const flater: { start: Flate; landing: Flate }[] = [
    { start: "arbeidsflate", landing: "arbeidsflate" },
    { start: "tilgangsstyring", landing: "tilgangsstyring" },
    { start: "infoportalen", landing: "arbeidsflate" },
    { start: "arbeidsflate-profil", landing: "arbeidsflate-profil" },
];

for (const { start, landing } of flater) {
    test(`Bruker er innlogget på alle flater etter innlogging fra ${start}`, async ({
        innlogging,
        flater: sider,
    }, testInfo) => {
        const brukere = parse(fs.readFileSync(testdata), { columns: true, skip_empty_lines: true }) as TestUser[];
        const privatPerson = brukere[testInfo.parallelIndex];

        await test.step(`Bruker går til ${start} uten å være logget inn`, async () => {
            await sider[start].navigateTo();
            if (start !== "infoportalen") {
                await innlogging.assertOnIdportenLogin();
            }
        });

        await test.step("Bruker logger inn", async () => {
            await innlogging.viaInnloggingsflyten(sider[landing], privatPerson);
        });

        await test.step(`Bruker skal være innlogget på ${landing}`, async () => {
            await sider[landing].assertLoggedIn(privatPerson);
        });

        await test.step("Bruker skal fortsatt være innlogget på de andre flatene", async () => {
            for (const flate of flater
                .map((f) => f.start)
                .filter((f) => f !== start)) {
                await sider[flate].navigateTo();
                await sider[flate].assertLoggedIn(privatPerson);
            }
        });
    });
}
