import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { Aktorbytte } from "../pages/felles/aktorbytte";
import { TilgangsstyringBrukere } from "../pages/tilgangsstyring/brukere";
import { TilgangsstyringForside } from "../pages/tilgangsstyring/forside";

export const tilgangsstyringFixture = base.extend<{
    tilgangsstyring: TilgangsstyringForside;
    brukere: TilgangsstyringBrukere;
    aktorbytte: Aktorbytte;
    urler: Urler;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    sprak: [Sprak.Bokmaal, { option: true }],

    tilgangsstyring: async ({ page, urler }, use) => {
        await use(new TilgangsstyringForside(page, urler.tilgangsstyring));
    },

    brukere: async ({ page, urler }, use) => {
        await use(new TilgangsstyringBrukere(page, urler.tilgangsstyring));
    },

    aktorbytte: async ({ page }, use) => {
        await use(new Aktorbytte(page));
    },
});
