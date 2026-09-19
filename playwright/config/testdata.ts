import { parse } from "csv-parse/sync";
import fs from "fs";
import { join } from "path";

import { Testbruker } from "../testdata";

import { requireEnv } from "./environment";

export type TestUser = {
  pid: string;
  name: string;
};

function testbrukerfil(path: Testbruker): string {
  return join(__dirname, "..", path, `${requireEnv("ENVIRONMENT")}.csv`);
}

function lesTestbrukere(path: Testbruker): TestUser[] | null {
  let innhold: string;

  try {
    innhold = fs.readFileSync(testbrukerfil(path), "utf8");
  } catch (feil) {
    if ((feil as NodeJS.ErrnoException).code !== "ENOENT") {
      throw feil;
    }

    return null;
  }

  return parse(innhold, { columns: true, skip_empty_lines: true, trim: true });
}

export function getTestUsers(path: Testbruker): TestUser[] {
  const brukere = lesTestbrukere(path);

  if (!brukere?.length) {
    throw new Error(`Fant ingen testbrukere i ${testbrukerfil(path)}`);
  }

  return brukere;
}

/** Leser testpersoner fra CSV i alle miljøer. Manglende testdata gir feil. */
export function getTestUser(path: Testbruker, indeks = 0): TestUser {
  const brukere = getTestUsers(path);

  if (!Number.isInteger(indeks) || indeks < 0 || indeks >= brukere.length) {
    throw new Error(
      `${testbrukerfil(path)} har ${brukere.length} rader, men worker nummer ${indeks + 1} ba om en bruker. Kjør med færre workere, eller legg til flere testpersoner.`,
    );
  }

  return brukere[indeks];
}
