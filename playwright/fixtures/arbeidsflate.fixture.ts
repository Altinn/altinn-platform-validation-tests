import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { ArbeidsflateForside } from "../pages/arbeidsflate/forside";
import { ArbeidsflateProfil } from "../pages/arbeidsflate/profil";

export const arbeidsflateFixture = base.extend<{
    arbeidsflate: ArbeidsflateForside;
    arbeidsflateProfil: ArbeidsflateProfil;
    urler: Urler;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    sprak: ["" as Sprak, { option: true }],

    arbeidsflate: async ({ page, urler, sprak }, use) => {
        await use(new ArbeidsflateForside(page, urler.arbeidsflate, sprak));
    },

    arbeidsflateProfil: async ({ page, urler, sprak }, use) => {
        await use(new ArbeidsflateProfil(page, urler.arbeidsflate, sprak));
    },
});
