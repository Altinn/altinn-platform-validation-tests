import { test } from "./fixtures/miljo.fixture";

/**
 * Miljøene en Playwright-test kan settes opp for. Hvert miljø er et project i
 * playwright.config.ts, med URLene sine der. Én liste gjør at en skrivefeil i et
 * `runInEnvironment`-kall gir typefeil i stedet for stilltiende å skru av testen.
 */
export const MILJOER = ["at23", "tt02", "prod"] as const;

export type Miljo = (typeof MILJOER)[number];

export type Urler = {
  arbeidsflate: string;
  tilgangsstyring: string;
  infoportal: string;
  platform: string;
};

/**
 * Sier hvilke miljøer testene i fila er satt opp for, og skipper dem i alle andre.
 *
 * Kalles øverst i spec-fila, over describe og test. Miljøet kommer fra projectet
 * testen kjører i. Deklarasjonen er et opt-in: et miljø som ikke er listet kjører
 * ikke testen, så en test skrevet mot at23 kan ikke havne i prod ved en forglemmelse.
 *
 * En fil som aldri kaller denne kjører ingen steder. Det er meningen, og det
 * fanges av global-setup.ts og ikke her, siden en test ingen starter aldri får
 * sagt fra om seg selv.
 */
export function runInEnvironment(...miljoer: Miljo[]) {
  if (miljoer.length === 0) {
    throw new Error(
      "runInEnvironment() trenger minst ett miljø, ellers kjører testen ingen steder",
    );
  }

  test.skip(
    ({ miljo }) => !miljoer.includes(miljo),
    `Testen er satt opp for ${miljoer.join(", ")}`,
  );
}
