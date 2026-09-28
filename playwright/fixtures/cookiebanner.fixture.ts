import { test as base } from "@playwright/test";

import { Cookiebanner } from "../pages/felles/cookiebanner";

// Cookiebanneret er det samme på alle flatene, så det hører ikke til én av dem.
export const cookiebannerFixture = base.extend<{
    cookiebanner: Cookiebanner;
}>({
    cookiebanner: async ({ page }, use) => {
        await use(new Cookiebanner(page));
    },
});
