import { parse } from "csv-parse/sync";
import fs from "fs";
import { join } from "path";

import { requireEnv } from "./environment";

export type TestUser = {
  pid: string;
  name: string;
};

const testdatamappe = join(__dirname, "..", "testdata");

function testbrukerfil(path: string): string {
  return join(testdatamappe, path, `${requireEnv("ENVIRONMENT")}.csv`);
}

function lesTestbrukere(path: string): TestUser[] | null {
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

export function getTestUsers(path: string): TestUser[] {
  const brukere = lesTestbrukere(path);

  if (!brukere?.length) {
    throw new Error(`Fant ingen testbrukere i ${testbrukerfil(path)}`);
  }

  return brukere;
}

/**
 * Leser samme CSV-struktur i alle miljøer. Inntil testdatafilen er tilgjengelig,
 * kan én testperson oppgis med TEST_USER_PID og TEST_USER_NAME.
 */
export function getTestUser(path: string, indeks = 0, workers = 1): TestUser {
  const brukere = lesTestbrukere(path);

  if (brukere !== null) {
    if (!brukere.length) {
      throw new Error(`Fant ingen testbrukere i ${testbrukerfil(path)}`);
    }

    if (!Number.isInteger(indeks) || indeks < 0 || indeks >= brukere.length) {
      throw new Error(
        `${testbrukerfil(path)} har ${brukere.length} rader, men worker nummer ${indeks + 1} ba om en bruker. Kjør med færre workere, eller legg til flere testpersoner.`,
      );
    }

    return brukere[indeks];
  }

  const grupper = fs.readdirSync(testdatamappe);
  if (!grupper.includes(path)) {
    throw new Error(`Ukjent testbrukerPath "${path}". Tilgjengelige grupper: ${grupper.join(", ")}.`);
  }

  if (workers !== 1 || indeks !== 0) {
    throw new Error(
      `Fant ikke ${testbrukerfil(path)}. Fallback til TEST_USER_PID krever --workers=1.`,
    );
  }

  return {
    pid: requireEnv("TEST_USER_PID"),
    get name() {
      return requireEnv("TEST_USER_NAME");
    },
  };
}
