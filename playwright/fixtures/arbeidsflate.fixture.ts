import { test as base } from '@playwright/test';
import { ArbeidsflateForside } from '../pages/arbeidsflate/forside';
import { ArbeidsflateProfil } from '../pages/arbeidsflate/profil';

/**
 * Hovedområdet arbeidsflate med sine undersider. Nye undersider legges til som
 * et felt her og en page object under pages/arbeidsflate/.
 */
export type Arbeidsflate = {
    forside: ArbeidsflateForside;
    profil: ArbeidsflateProfil;
};

export const test = base.extend<{ arbeidsflate: Arbeidsflate }>({
    arbeidsflate: async ({ page }, use) => {
        await use({
            forside: new ArbeidsflateForside(page),
            profil: new ArbeidsflateProfil(page),
        });
    },
});
