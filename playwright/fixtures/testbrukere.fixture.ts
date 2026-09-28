import { test as base } from "@playwright/test";
import { readFileSync } from "fs";
import path from "path";

import { TestUser } from "../config/environment";

// TEST_DATA_PATH peker på en annen testdata-mappe, for eksempel en som er montert inn i poden.
const testdata = process.env.TEST_DATA_PATH ?? path.join(__dirname, "..", "testdata");

function lesTestbrukere(gruppe: string, miljo: string): TestUser[] {
    const fil = path.join(testdata, gruppe, `${miljo}.csv`);
    const [, ...rader] = readFileSync(fil, "utf8").trim().split(/\r?\n/);

    return rader.map((rad) => {
        const [pid, name] = rad.split(",");
        return { pid, name };
    });
}

export const testbrukereFixture = base.extend<{ user: TestUser; miljo: string }>({
    miljo: ["", { option: true }],

    // Én bruker per worker, så tester som kjører samtidig ikke endrer språket for hverandre.
    user: async ({ miljo }, use, testInfo) => {
        const brukere = lesTestbrukere("privatPersonUtenVirksomhet", miljo);
        await use(brukere[testInfo.parallelIndex % brukere.length]);
    },
});
