import { ArbeidsflateForside } from "../pages/arbeidsflate/forside";
import { ArbeidsflateProfil } from "../pages/arbeidsflate/profil";
import { test as options } from "./options.fixture";

/**
 * Hovedområdet arbeidsflate med sine undersider. Nye undersider legges til som
 * et felt her og en page object under pages/arbeidsflate/.
 */
export type Arbeidsflate = {
    forside: ArbeidsflateForside;
    profil: ArbeidsflateProfil;
};

export const test = options.extend<{ arbeidsflate: Arbeidsflate }>({
    arbeidsflate: async ({ page, urler }, use) => {
        await use({
            forside: new ArbeidsflateForside(page, urler.arbeidsflate),
            profil: new ArbeidsflateProfil(page, urler.arbeidsflate),
        });
    },
});
