import { parse } from "csv-parse/sync";
import fs from "fs";
import { join } from "path";

import type { Miljo } from "../miljo";
import { Testbruker } from "../testdata";
import type { TestUser } from "./environment";

/** Testpersonen for workeren, fra gruppens CSV-fil for miljøet. */
export function getTestUser(gruppe: Testbruker, miljo: Miljo, indeks: number): TestUser {
    // TESTDATA_ROOT peker på testdata som ikke kan sjekkes inn, som prod-brukerne.
    const fil = join(process.env.TESTDATA_ROOT ?? join(__dirname, ".."), gruppe, `${miljo}.csv`);
    const brukere: TestUser[] = parse(fs.readFileSync(fil, "utf8"), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    if (indeks >= brukere.length) {
        throw new Error(
            `${fil} har ${brukere.length} rader, men worker nummer ${indeks + 1} trenger en. Kjør med færre workere, eller legg til flere testpersoner.`,
        );
    }

    return brukere[indeks];
}
