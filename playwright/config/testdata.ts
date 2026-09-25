import { parse } from "csv-parse/sync";
import fs from "fs";
import { join } from "path";

import type { Miljo } from "../miljo";
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

/** Testpersonen for workeren, fra gruppens CSV-fil for miljøet. */
export function getTestUser(path: Testbruker, miljo: Miljo, indeks: number): TestUser {
    const fil = testbrukerfil(path, miljo);
    const brukere: TestUser[] = fs.existsSync(fil)
        ? parse(fs.readFileSync(fil, "utf8"), { columns: true, skip_empty_lines: true, trim: true })
        : [];

    if (brukere.length === 0) {
        throw new Error(`Fant ingen testbrukere i ${fil}`);
    }

    if (indeks >= brukere.length) {
        throw new Error(
            `${fil} har ${brukere.length} rader, men worker nummer ${indeks + 1} ba om en bruker. Kjør med færre workere, eller legg til flere testpersoner.`,
        );
    }

    return brukere[indeks];
}
