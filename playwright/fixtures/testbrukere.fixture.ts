import { test as base } from "@playwright/test";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
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
// retryen den igjen. Brukere testen allerede har fått, hoppes over.
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
            if (reservertAv(fil) === testId) {
                return bruker;
            }
        }
    }

    return undefined;
}

/**
 * Reserverer testbrukere for én test. Reservasjonene gjelder på tvers av grupper, siden
 * de er per fødselsnummer, og frigis samlet når testen er ferdig.
 */
export class Testbrukere {
    private readonly reservert = new Set<string>();

    constructor(
        private readonly miljo: string,
        private readonly katalog: string,
        private readonly testId: string,
    ) {}

    /**
     * Uten `tilfeldig` tas de første ledige brukerne i fila. Med `tilfeldig` velges de
     * tilfeldig blant de ledige, så samme brukere ikke brukes kjøring etter kjøring.
     */
    reserver(gruppe: string, antall: number, { tilfeldig = false } = {}): TestUser[] {
        const alle = lesTestbrukere(gruppe, this.miljo);
        const brukere = tilfeldig ? [...alle].sort(() => Math.random() - 0.5) : alle;

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

    frigi() {
        for (const pid of this.reservert) {
            rmSync(path.join(this.katalog, pid), { force: true });
        }
        this.reservert.clear();
    }
}

export const testbrukereFixture = base.extend<{
    testbrukere: Testbrukere;
    user: TestUser;
    miljo: string;
}>({
    miljo: ["", { option: true }],

    // Ingen test deler bruker, og dermed sesjon, med en annen. Brukerne frigis når testen
    // er ferdig, så neste test kan bruke dem. Playwright tømmer output-mappa ved start,
    // så reservasjonene gjelder én kjøring.
    testbrukere: async ({ miljo }, use, testInfo) => {
        const katalog = path.join(testInfo.project.outputDir, ".testbrukere", miljo);
        const testbrukere = new Testbrukere(miljo, katalog, testInfo.testId);
        await use(testbrukere);
        testbrukere.frigi();
    },

    // Snarvei for testene som bare trenger én privatperson.
    user: async ({ testbrukere }, use) => {
        const [bruker] = testbrukere.reserver("privatPersonUtenVirksomhet", 1);
        await use(bruker);
    },
});
