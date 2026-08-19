import { test as sprakTest } from './sprak.fixture';
import { TilgangsstyringForside } from '../pages/tilgangsstyring/forside';

/**
 * Hovedområdet tilgangsstyring med sine undersider. Nye undersider legges til som
 * et felt her og en page object under pages/tilgangsstyring/.
 */
export type Tilgangsstyring = {
    forside: TilgangsstyringForside;
};

export const test = sprakTest.extend<{ tilgangsstyring: Tilgangsstyring }>({
    tilgangsstyring: async ({ page, sprak }, use) => {
        await use({
            forside: new TilgangsstyringForside(page, sprak),
        });
    },
});
