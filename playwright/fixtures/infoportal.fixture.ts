import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { InfoportalForside } from "../pages/infoportal/forside";

export const infoportalFixture = base.extend<{
    infoportal: InfoportalForside;
    urler: Urler;
}>({
    urler: [{} as Urler, { option: true }],

    infoportal: async ({ page, urler }, use) => {
        await use(new InfoportalForside(page, urler.infoportal));
    },
});
