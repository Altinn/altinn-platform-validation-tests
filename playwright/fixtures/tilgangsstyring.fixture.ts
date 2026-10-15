import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { TilgangsstyringForsidePom } from "../pages/tilgangsstyring/forside";

export const tilgangsstyringFixture = base.extend<{
    tilgangsstyring: TilgangsstyringForsidePom;
    urler: Urler;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    sprak: ["" as Sprak, { option: true }],

    tilgangsstyring: async ({ page, urler, sprak }, use) => {
        await use(new TilgangsstyringForsidePom(page, urler.tilgangsstyring, sprak));
    },
});
