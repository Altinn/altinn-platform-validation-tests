import fs from "fs";
import path from "path";

import { oppsettsfeil } from "./feil";

const testDir = path.join(__dirname, "tests");

/**
 * Alle spec-filene under tests/, uansett hvor dypt de ligger.
 */
function specFiler(katalog: string): string[] {
  return fs.readdirSync(katalog, { withFileTypes: true }).flatMap((oppf) => {
    const sti = path.join(katalog, oppf.name);

    if (oppf.isDirectory()) {
      return specFiler(sti);
    }

    return oppf.name.endsWith(".spec.ts") ? [sti] : [];
  });
}

/**
 * Om fila kaller `runInEnvironment` på ordentlig.
 *
 * Et utkommentert kall er like lite en deklarasjon som et manglende ett, så linjer
 * som starter med `//` eller `*` teller ikke. Vi ser bare på linjestarten og prøver
 * ikke å lese TypeScript: et forsøk på å strippe kommentarer med regex spiser ekte
 * kode så snart en streng inneholder `/*`, for eksempel en glob.
 */
function harDeklarasjon(innhold: string): boolean {
  return innhold.split("\n").some((linje) => {
    const kode = linje.trim();

    if (kode.startsWith("//") || kode.startsWith("*")) {
      return false;
    }

    return /\brunInEnvironment\s*\(/.test(kode);
  });
}

/**
 * Krever at hver spec-fil sier hvilke miljøer den er satt opp for.
 *
 * En fil uten `runInEnvironment` kjører ingen steder, og det er ikke noe testen
 * selv kan si fra om: en test ingen starter rekker aldri å klage. Derfor sjekkes
 * det her, før noen tester kjører, slik at en glemt deklarasjon oppdages i PR og
 * ikke tre måneder senere.
 */
export default function globalSetup() {
  const mangler = specFiler(testDir).filter(
    (fil) => !harDeklarasjon(fs.readFileSync(fil, "utf8"))
  );

  if (mangler.length > 0) {
    const liste = mangler
      .map((fil) => `  ${path.relative(__dirname, fil)}`)
      .join("\n");

    // Kastes og ikke process.exit: da rekker reporterne å skrive test-results.xml
    // og test-results.json, slik at en CI-kjøring får en rapport og ikke bare en
    // exit-kode.
    throw oppsettsfeil(
      `Disse spec-filene mangler runInEnvironment(), og kjører derfor ingen steder:\n${liste}\n\n` +
        "Legg kallet øverst i fila med miljøene testene er satt opp for, for eksempel " +
        "runInEnvironment('at22', 'at23', 'tt02')."
    );
  }
}
