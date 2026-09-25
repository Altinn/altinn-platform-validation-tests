/**
 * Miljøene Playwright-testene kjører i. Hvert miljø er et project i
 * playwright.config.ts, med URLene og testene sine der.
 */
export type Miljo = "at23" | "tt02" | "prod";

export type Urler = {
  arbeidsflate: string;
  tilgangsstyring: string;
  infoportal: string;
  platform: string;
};
