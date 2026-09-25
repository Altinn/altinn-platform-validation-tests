import { mergeTests } from "@playwright/test";

import { TilgangsstyringForside } from "../pages/tilgangsstyring/forside";
import { test as options } from "./options.fixture";
import { test as sprakTest } from "./sprak.fixture";

/**
 * Hovedområdet tilgangsstyring med sine undersider. Nye undersider legges til som
 * et felt her og en page object under pages/tilgangsstyring/.
 */
export type Tilgangsstyring = {
    forside: TilgangsstyringForside;
};

export const test = mergeTests(options, sprakTest).extend<{ tilgangsstyring: Tilgangsstyring }>({
    tilgangsstyring: async ({ page, sprak, urler }, use) => {
        await use({
            forside: new TilgangsstyringForside(page, urler.tilgangsstyring, sprak),
        });
    },
});
