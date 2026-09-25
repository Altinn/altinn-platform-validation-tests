import { test as base } from "@playwright/test";

import type { Miljo, Urler } from "../miljo";

/**
 * Miljøet og URLene til flatene settes av projectet i playwright.config.ts.
 * Resten av fixturene og page objectene får dem herfra.
 */
// Alle fixturene her er worker-scoped, så det er ingen test-scoped fixturer å typesette.
type IngenTestfixturer = Record<never, never>;

export const test = base.extend<
    IngenTestfixturer,
    { miljo: Miljo; urler: Urler; mockporten: boolean }
>({
    miljo: [undefined as unknown as Miljo, { option: true, scope: "worker" }],
    urler: [undefined as unknown as Urler, { option: true, scope: "worker" }],
    mockporten: [false, { option: true, scope: "worker" }],
});
