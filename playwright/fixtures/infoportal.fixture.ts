import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { InfoportalForside } from "../pages/infoportal/forside";

export const infoportalFixture = base.extend<{
    infoportal: InfoportalForside;
    urler: Urler;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    sprak: ["" as Sprak, { option: true }],

    infoportal: async ({ page, urler, sprak }, use) => {
        await use(new InfoportalForside(page, urler.infoportal, sprak));
    },
});
