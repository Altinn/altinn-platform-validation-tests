/**
 * Miljøene Playwright-testene kjører i. Hvert miljø er et project i
 * playwright.config.ts, med URLene og testene sine der.
 */
export const MILJOER = ["at23", "tt02", "prod"] as const;

export type Miljo = (typeof MILJOER)[number];

export type Urler = {
  arbeidsflate: string;
  tilgangsstyring: string;
  infoportal: string;
  platform: string;
};
