import { test as base } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

import { TestUser } from "../config/environment";

// TEST_DATA_PATH peker på en annen testdata-mappe, for eksempel fra kubernetes
const testdata =
    process.env.TEST_DATA_PATH ?? path.join(__dirname, "..", "testdata");

function lesTestbrukere(gruppe: string, miljo: string): TestUser[] {
    const fil = path.join(testdata, gruppe, `${miljo}.csv`);
    const [, ...rader] = readFileSync(fil, "utf8").trim().split(/\r?\n/);

    return rader.map((rad) => {
        const [pid, name] = rad.split(",");
        return { pid, name };
    });
}

// Første ledige bruker reserveres med en fil som bare kan opprettes én gang. En retry
// finner igjen sin egen reservasjon, og ingen test får en bruker en annen test har hatt.
function reserverTestbruker(brukere: TestUser[], katalog: string, testId: string): TestUser {
    mkdirSync(katalog, { recursive: true });

    for (const bruker of brukere) {
        const fil = path.join(katalog, bruker.pid);
        try {
            writeFileSync(fil, testId, { flag: "wx" });
            return bruker;
        } catch {
            if (readFileSync(fil, "utf8") === testId) {
                return bruker;
            }
        }
    }

    throw new Error(`Alle ${brukere.length} testbrukerne i ${katalog} er brukt opp.`);
}

export const testbrukereFixture = base.extend<{
    user: TestUser;
    miljo: string;
}>({
    miljo: ["", { option: true }],

    // Én bruker per test, så ingen test arver språk eller sesjon fra en annen. Playwright
    // tømmer output-mappa ved start, så reservasjonene gjelder én kjøring.
    user: async ({ miljo }, use, testInfo) => {
        const brukere = lesTestbrukere("privatPersonUtenVirksomhet", miljo);
        const katalog = path.join(testInfo.project.outputDir, ".testbrukere", miljo);
        await use(reserverTestbruker(brukere, katalog, testInfo.testId));
    },
});
