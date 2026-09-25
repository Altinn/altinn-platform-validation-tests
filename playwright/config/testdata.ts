import { parse } from "csv-parse/sync";
import fs from "fs";
import { join } from "path";

import { Miljo } from "../miljo";
import { Testbruker } from "../testdata";

export type TestUser = {
    pid: string;
    name: string;
};

// Stiene i Testbruker er relative til playwright/. TESTDATA_ROOT peker et annet
// sted, for testdata som ikke kan sjekkes inn, som prod-brukerne fra en secret.
function testbrukerfil(path: Testbruker, miljo: Miljo): string {
    const rot = process.env.TESTDATA_ROOT ?? join(__dirname, "..");

    return join(rot, path, `${miljo}.csv`);
}

function lesTestbrukere(path: Testbruker, miljo: Miljo): TestUser[] | null {
    let innhold: string;

    try {
        innhold = fs.readFileSync(testbrukerfil(path, miljo), "utf8");
    } catch (feil) {
        if ((feil as NodeJS.ErrnoException).code !== "ENOENT") {
            throw feil;
        }

        return null;
    }

    return parse(innhold, { columns: true, skip_empty_lines: true, trim: true });
}

export function getTestUsers(path: Testbruker, miljo: Miljo): TestUser[] {
    const brukere = lesTestbrukere(path, miljo);

    if (!brukere?.length) {
        throw new Error(`Fant ingen testbrukere i ${testbrukerfil(path, miljo)}`);
    }

    return brukere;
}

/** Leser testpersoner fra CSV i alle miljøer. Manglende testdata gir feil. */
export function getTestUser(path: Testbruker, miljo: Miljo, indeks = 0): TestUser {
    const brukere = getTestUsers(path, miljo);

    if (!Number.isInteger(indeks) || indeks < 0 || indeks >= brukere.length) {
        throw new Error(
            `${testbrukerfil(path, miljo)} har ${brukere.length} rader, men worker nummer ${indeks + 1} ba om en bruker. Kjør med færre workere, eller legg til flere testpersoner.`,
        );
    }

    return brukere[indeks];
}
