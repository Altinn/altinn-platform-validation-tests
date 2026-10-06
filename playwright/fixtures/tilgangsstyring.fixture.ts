import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { TilgangsstyringBrukere } from "../pages/tilgangsstyring/brukere";
import { TilgangsstyringForside } from "../pages/tilgangsstyring/forside";

export const tilgangsstyringFixture = base.extend<{
    tilgangsstyring: TilgangsstyringForside;
    brukere: TilgangsstyringBrukere;
    urler: Urler;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    sprak: [Sprak.Bokmaal, { option: true }],

    tilgangsstyring: async ({ page, urler }, use) => {
        await use(new TilgangsstyringForside(page, urler.tilgangsstyring));
    },

    brukere: async ({ page, sprak }, use) => {
        await use(new TilgangsstyringBrukere(page, sprak));
    },
});
