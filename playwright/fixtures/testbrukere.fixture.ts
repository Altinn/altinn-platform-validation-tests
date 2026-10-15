import { test as base } from "@playwright/test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import path from "path";

import { TestUser } from "../config/environment";

// TEST_DATA_PATH peker på en annen testdata-mappe, for eksempel fra kubernetes
const testdata =
    process.env.TEST_DATA_PATH ?? path.join(__dirname, "..", "testdata");

export function lesTestbrukere(gruppe: string, miljo: string): TestUser[] {
    const fil = path.join(testdata, gruppe, `${miljo}.csv`);
    const [, ...rader] = readFileSync(fil, "utf8").trim().split(/\r?\n/);

    return rader.map((rad) => {
        const [pid, name] = rad.split(",");
        return { pid, name };
    });
}

// Fila kan være slettet siden vi prøvde å opprette den, fordi en annen test frigav brukeren.
function reservertAv(fil: string): string | undefined {
    try {
        return readFileSync(fil, "utf8");
    } catch {
        return undefined;
    }
}

// Første ledige bruker reserveres med en fil som bare kan opprettes én gang, så to tester
// som kjører samtidig aldri får samme bruker. Overlever reservasjonen en krasj, finner
// retryen den igjen.
function reserverTestbruker(brukere: TestUser[], katalog: string, testId: string): TestUser {
    mkdirSync(katalog, { recursive: true });

    for (const bruker of brukere) {
        const fil = path.join(katalog, bruker.pid);
        try {
            writeFileSync(fil, testId, { flag: "wx" });
            return bruker;
        } catch {
            if (reservertAv(fil) === testId) {
                return bruker;
            }
        }
    }

    throw new Error(`Alle ${brukere.length} testbrukerne i ${katalog} er i bruk samtidig.`);
}

export const testbrukereFixture = base.extend<{
    user: TestUser;
    miljo: string;
}>({
    miljo: ["", { option: true }],

    // Én bruker om gangen per test, så ingen test deler sesjon med en annen. Brukeren
    // frigis når testen er ferdig, så neste test kan bruke den. Playwright tømmer
    // output-mappa ved start, så reservasjonene gjelder én kjøring.
    user: async ({ miljo }, use, testInfo) => {
        const brukere = lesTestbrukere("privatPersonUtenVirksomhet", miljo);
        const katalog = path.join(testInfo.project.outputDir, ".testbrukere", miljo);
        const bruker = reserverTestbruker(brukere, katalog, testInfo.testId);
        await use(bruker);
        rmSync(path.join(katalog, bruker.pid), { force: true });
    },
});
