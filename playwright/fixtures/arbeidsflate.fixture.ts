import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { ArbeidsflateForside } from "../pages/arbeidsflate/forside";
import { ArbeidsflateProfil } from "../pages/arbeidsflate/profil";

export const arbeidsflateFixture = base.extend<{
    arbeidsflate: ArbeidsflateForside;
    arbeidsflateProfil: ArbeidsflateProfil;
    urler: Urler;
}>({
    urler: [{} as Urler, { option: true }],

    arbeidsflate: async ({ page, urler }, use) => {
        await use(new ArbeidsflateForside(page, urler.arbeidsflate));
    },

    arbeidsflateProfil: async ({ page, urler }, use) => {
        await use(new ArbeidsflateProfil(page, urler.arbeidsflate));
    },
});
