import { test as base } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

import { TestUser } from "../config/environment";

// TEST_DATA_PATH peker på en annen testdata-mappe, for eksempel fra kubernetes
const testdata =
    process.env.TEST_DATA_PATH ?? path.join(__dirname, "..", "testdata");

// Navnekolonnene kommer fra Register.
const KOLONNER = "pid,name,first_name,middle_name,last_name";

function lesTestbrukere(gruppe: string, miljo: string): TestUser[] {
    const fil = path.join(testdata, gruppe, `${miljo}.csv`);
    const [header, ...rader] = readFileSync(fil, "utf8").trim().split(/\r?\n/);
    if (header !== KOLONNER) {
        throw new Error(`${fil} må ha kolonnene ${KOLONNER}, men har ${header}.`);
    }

    return rader.map((rad) => {
        const [pid, name, firstName, middleName, lastName] = rad.split(",");
        return { pid, name, firstName, middleName: middleName || undefined, lastName };
    });
}

// Første ledige bruker i lista reserveres med en fil som bare kan opprettes én gang, så to tester
// som kjører samtidig aldri får samme bruker. Reservasjonen blir stående resten av kjøringen,
// så ingen bruker brukes to ganger, heller ikke av en retry.
function reserverTestbruker(
    brukere: TestUser[],
    katalog: string,
    testId: string,
    allerede: Set<string>,
): TestUser | undefined {
    mkdirSync(katalog, { recursive: true });

    for (const bruker of brukere.filter((b) => !allerede.has(b.pid))) {
        const fil = path.join(katalog, bruker.pid);
        try {
            writeFileSync(fil, testId, { flag: "wx" });
            return bruker;
        } catch {
            // Reservert av en annen test.
        }
    }

    return undefined;
}

/**
 * Reserverer testbrukere for én test. Reservasjonene gjelder på tvers av grupper, siden
 * de er per fødselsnummer, og frigis ikke før neste kjøring.
 */
export class Testbrukere {
    private readonly reservert = new Set<string>();

    constructor(
        private readonly miljo: string,
        private readonly katalog: string,
        private readonly testId: string,
    ) {}

    // Brukerne stokkes, så testene ikke bruker de samme brukerne kjøring etter kjøring.
    reserver(gruppe: string, antall: number): TestUser[] {
        const brukere = lesTestbrukere(gruppe, this.miljo).sort(() => Math.random() - 0.5);

        return Array.from({ length: antall }, () => {
            const bruker = reserverTestbruker(brukere, this.katalog, this.testId, this.reservert);
            if (!bruker) {
                throw new Error(
                    `Fant ikke ${antall} ledige testbrukere i ${gruppe}/${this.miljo}.csv; ` +
                    `de ${brukere.length} er i bruk samtidig.`,
                );
            }
            this.reservert.add(bruker.pid);
            return bruker;
        });
    }
}

export const testbrukereFixture = base.extend<{
    testbrukere: Testbrukere;
    user: TestUser;
    miljo: string;
}>({
    miljo: ["", { option: true }],

    // Ingen bruker brukes av mer enn én test per kjøring. Innboksen cacher aktørlisten til en
    // bruker i 12 minutter, så en bruker som kommer tilbake, ser ikke nye fullmakter.
    // Playwright tømmer output-mappa ved start, så reservasjonene gjelder én kjøring.
    testbrukere: async ({ miljo }, use, testInfo) => {
        const katalog = path.join(testInfo.project.outputDir, ".testbrukere", miljo);
        await use(new Testbrukere(miljo, katalog, testInfo.testId));
    },

    // Snarvei for testene som bare trenger én privatperson.
    user: async ({ testbrukere }, use) => {
        const [bruker] = testbrukere.reserver("privatPersonUtenVirksomhet", 1);
        console.log(`Testbruker: ${bruker.name}`);
        await use(bruker);
    },
});
