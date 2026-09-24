import { TestDetails } from "@playwright/test";

/**
 * Miljøene en Playwright-test kan settes opp for. Hvert miljø er et project i
 * playwright.config.ts, og én liste gjør at en skrivefeil i et `miljoer`-kall gir
 * typefeil i stedet for stilltiende å skru av testen.
 */
export const MILJOER = ["at22", "at23", "tt02", "prod"] as const;

export type Miljo = (typeof MILJOER)[number];

export type Urler = {
  arbeidsflate: string;
  tilgangsstyring: string;
  infoportal: string;
  platform: string;
};

export const urler: Record<Miljo, Urler> = {
  at22: {
    arbeidsflate: "https://af.at22.altinn.cloud",
    tilgangsstyring: "https://am.ui.at22.altinn.cloud",
    infoportal: "https://info.at22.altinn.cloud",
    platform: "https://platform.at22.altinn.cloud",
  },
  at23: {
    arbeidsflate: "https://af.at23.altinn.cloud",
    tilgangsstyring: "https://am.ui.at23.altinn.cloud",
    infoportal: "https://info.at23.altinn.cloud",
    platform: "https://platform.at23.altinn.cloud",
  },
  tt02: {
    arbeidsflate: "https://af.tt02.altinn.no",
    tilgangsstyring: "https://am.ui.tt02.altinn.no",
    infoportal: "https://info.tt02.altinn.no",
    platform: "https://platform.tt02.altinn.no",
  },
  prod: {
    arbeidsflate: "https://af.altinn.no",
    tilgangsstyring: "https://am.ui.altinn.no",
    infoportal: "https://info.altinn.no",
    platform: "https://platform.altinn.no",
  },
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
