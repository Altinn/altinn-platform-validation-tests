import { test as base } from "@playwright/test";

import { Testapp, Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { App } from "../pages/apps/app";

export const appFixture = base.extend<{
    app: App;
    testapp: Testapp;
    urler: Urler;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    sprak: ["" as Sprak, { option: true }],
    // Appen fra ttd som testene bruker, satt per miljø i playwright.config.ts.
    testapp: [{} as Testapp, { option: true }],

    app: async ({ page, urler, testapp, sprak }, use) => {
        await use(new App(page, urler.apps, testapp, sprak));
    },
});
