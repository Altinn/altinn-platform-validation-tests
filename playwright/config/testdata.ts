import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

/**
 * Leser en CSV-fil med overskriftsrad fra playwright/testdata, én rad per objekt.
 * Stien er relativ til testdata/, slik fetchTestData i K6 er relativ til K6/testdata.
 */
export function readCsv<T>(filename: string): T[] {
    return parse(fs.readFileSync(path.join(__dirname, "..", "testdata", filename)), {
        columns: true,
        skip_empty_lines: true,
    });
}
