import { test } from "@playwright/test";

/**
 * Miljøene en Playwright-test kan settes opp for. Én liste, slik at en skrivefeil
 * i et `runInEnvironment`-kall gir feil i stedet for stilltiende å skru av testen.
 */
export const MILJOER = ["at22", "at23", "tt02", "prod"] as const;

export type Miljo = (typeof MILJOER)[number];

/**
 * Sier hvilke miljøer testene i fila er satt opp for, og skipper dem i alle andre.
 *
 * Kalles øverst i spec-fila, over describe og test. Deklarasjonen er et opt-in:
 * et miljø som ikke er listet kjører ikke testen, så en test skrevet mot at23
 * kan ikke havne i prod ved en forglemmelse.
 *
 * En fil som aldri kaller denne kjører ingen steder. Det er meningen, og det
 * fanges av lint og ikke her, siden en test ingen starter aldri får sagt fra om
 * seg selv.
 */
export function runInEnvironment(...miljoer: Miljo[]) {
  if (miljoer.length === 0) {
    throw new Error(
      "runInEnvironment() trenger minst ett miljø, ellers kjører testen ingen steder"
    );
  }

  const ukjente = miljoer.filter((miljo) => !MILJOER.includes(miljo));

  if (ukjente.length > 0) {
    throw new Error(
      `Ukjent miljø ${ukjente.join(", ")}. Kjente miljøer er ${MILJOER.join(", ")}`
    );
  }

  // playwright.config.ts har allerede feilet hvis ENVIRONMENT mangler.
  const miljo = process.env.ENVIRONMENT as Miljo;

  test.skip(
    !miljoer.includes(miljo),
    `Testen er satt opp for ${miljoer.join(", ")}, ikke ${miljo}`
  );
}
