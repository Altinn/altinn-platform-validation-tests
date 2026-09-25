import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

import type { TestUser } from "../../config/environment";
import { Flate, testMedFlater as test } from "../../fixtures/test";
import { gjeldendeMiljo, runInEnvironment } from "../../miljo";

// Endrer ingen data. Utloggingen går gjennom authentication /logout, som sender
// brukeren videre til /logout/handleloggedout, og det er de to endepunktene testen
// er her for. I prod går innloggingen via mockporten, siden TestID-skjermbildene
// bare finnes i testmiljøene.
runInEnvironment("at23", "tt02", "prod");

// Testpersonene, én rad per worker.
const testdata = path.join(__dirname, "../../testdata/privatPersonUtenVirksomhet", `${gjeldendeMiljo()}.csv`);

/**
 * Flatene som skal være utlogget etterpå. Infoportalen er med her, men ikke som
 * utgangspunkt: den er åpen og har ikke hovednavigasjonen utloggingen ligger i, så
 * den kan sjekkes men ikke logges ut fra.
 */
const flater: Flate[] = [
    "arbeidsflate",
    "arbeidsflate-profil",
    "tilgangsstyring",
    "infoportalen",
];

const utloggingsflater = flater.filter((flate) => flate !== "infoportalen");

for (const start of utloggingsflater) {
    // Sesjonen gjelder på tvers av flatene, så en utlogging fra én av dem skal ta
    // brukeren ut av alle.
    test(`Bruker er utlogget på alle flater etter utlogging fra ${start}`, async ({
        innlogging,
        flater: sider,
    }, testInfo) => {
        const brukere = parse(fs.readFileSync(testdata), { columns: true, skip_empty_lines: true }) as TestUser[];
        const privatPerson = brukere[testInfo.parallelIndex];

        await test.step(`Bruker logger inn og lander på ${start}`, async () => {
            await innlogging.logIn(sider[start], privatPerson);
            await sider[start].assertLoggedIn(privatPerson);
        });

        await test.step("Bruker logger ut", async () => {
            await innlogging.logOut();
            await innlogging.assertLoggedOut();
        });

        await test.step("Ingen av flatene viser brukeren som innlogget", async () => {
            for (const flate of flater) {
                await sider[flate].navigateTo();
                await sider[flate].assertLoggedOut(privatPerson);
            }
        });
    });
}
