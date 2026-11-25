import { test as base } from "@playwright/test";

import { TestAppConfig, Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { AppPom } from "../pages/apps/app";

export const appFixture = base.extend<{
    app: AppPom;
    testAppConfig: TestAppConfig;
    urler: Urler;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    sprak: ["" as Sprak, { option: true }],
    // Appen fra ttd som testene bruker, satt per miljø i playwright.config.ts.
    testAppConfig: [{} as TestAppConfig, { option: true }],

    app: async ({ page, urler, testAppConfig, sprak }, use) => {
        await use(new AppPom(page, urler.apps, testAppConfig, sprak));
    },
});
