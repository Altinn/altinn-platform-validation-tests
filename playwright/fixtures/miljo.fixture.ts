import { test as base } from "@playwright/test";

export type Urler = {
    arbeidsflate: string;
    tilgangsstyring: string;
    infoportal: string;
    platform: string;
};

/**
 * Verdiene som skiller miljøene fra hverandre. De settes av hvert project i
 * playwright.config.ts, og fixturene og page objectene får dem herfra.
 */
// Alle fixturene her er worker-scoped, så det er ingen test-scoped fixturer å typesette.
type IngenTestfixturer = Record<never, never>;

export const test = base.extend<IngenTestfixturer, { urler: Urler; mockporten: boolean }>({
    urler: [undefined as unknown as Urler, { option: true, scope: "worker" }],
    mockporten: [false, { option: true, scope: "worker" }],
});
