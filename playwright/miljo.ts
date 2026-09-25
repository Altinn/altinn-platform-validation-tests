import { TestDetails } from "@playwright/test";

/**
 * Miljøene en Playwright-test kan settes opp for. Hvert miljø er et project i
 * playwright.config.ts, med URLene sine der. Én liste gjør at en skrivefeil i et
 * `miljoer`-kall gir typefeil i stedet for stilltiende å skru av testen.
 */
export const MILJOER = ["at23", "tt02", "prod"] as const;

export type Miljo = (typeof MILJOER)[number];

export type Urler = {
  arbeidsflate: string;
  tilgangsstyring: string;
  infoportal: string;
  platform: string;
};

/** Taggen et miljø-project velger testene sine med. */
export function miljotag(miljo: Miljo): string {
  return `@${miljo}`;
}

/**
 * Sier hvilke miljøer en test eller describe-blokk er satt opp for, som tags
 * projectene i playwright.config.ts velger på:
 *
 *   test("...", miljoer("at23", "tt02"), async ({ ... }) => { ... });
 *
 * Et miljø som ikke er listet kjører ikke testen, så en test skrevet mot at23
 * kan ikke havne i prod ved en forglemmelse. En spec-fil som aldri kaller denne
 * kjører ingen steder, og det fanges av global-setup.ts.
 */
export function miljoer(...miljoer: Miljo[]): TestDetails {
  if (miljoer.length === 0) {
    throw new Error(
      "miljoer() trenger minst ett miljø, ellers kjører testen ingen steder",
    );
  }

  return { tag: miljoer.map(miljotag) };
}
