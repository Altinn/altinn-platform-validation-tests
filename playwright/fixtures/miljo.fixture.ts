import { test as base } from "@playwright/test";

import type { Urler } from "../miljo";

/**
 * URLene til flatene og om Mockporten skal brukes settes av projectet i
 * playwright.config.ts. Resten av fixturene og page objectene får dem herfra.
 */
// Alle fixturene her er worker-scoped, så det er ingen test-scoped fixturer å typesette.
type IngenTestfixturer = Record<never, never>;

export const test = base.extend<
    IngenTestfixturer,
    { urler: Urler; mockporten: boolean }
>({
    urler: [undefined as unknown as Urler, { option: true, scope: "worker" }],
    mockporten: [false, { option: true, scope: "worker" }],
});
