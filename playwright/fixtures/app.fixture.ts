import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { App } from "../pages/apps/app";

export const appFixture = base.extend<{
    app: App;
    testapp: string;
    urler: Urler;
}>({
    urler: [{} as Urler, { option: true }],
    // Appen fra ttd som testene bruker, satt per miljø i playwright.config.ts.
    testapp: ["", { option: true }],

    app: async ({ page, urler, testapp }, use) => {
        await use(new App(page, urler.apps, testapp));
    },
});
