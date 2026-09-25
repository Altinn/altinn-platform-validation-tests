import { test as base } from "@playwright/test";

export type Urler = {
    arbeidsflate: string;
    tilgangsstyring: string;
    infoportal: string;
    platform: string;
};

export type Options = { urler: Urler; mockporten: boolean };

/**
 * Verdiene som skiller miljøene fra hverandre. Hvert project i playwright.config.ts
 * setter dem i `use`, se https://playwright.dev/docs/test-parameterize#parameterized-projects.
 */
export const test = base.extend<Options>({
    // Ingen standard: hvert project setter URLene sine.
    urler: [undefined as unknown as Urler, { option: true }],
    mockporten: [false, { option: true }],
});
