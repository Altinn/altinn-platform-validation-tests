import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { ArbeidsflateAktorerPom } from "../pages/arbeidsflate/aktorer";
import { ArbeidsflateForsidePom } from "../pages/arbeidsflate/forside";
import { ArbeidsflateProfilPom } from "../pages/arbeidsflate/profil";

export const arbeidsflateFixture = base.extend<{
    arbeidsflate: ArbeidsflateForsidePom;
    arbeidsflateProfil: ArbeidsflateProfilPom;
    arbeidsflateAktorer: ArbeidsflateAktorerPom;
    urler: Urler;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    sprak: ["" as Sprak, { option: true }],

    arbeidsflate: async ({ page, urler, sprak }, use) => {
        await use(new ArbeidsflateForsidePom(page, urler.arbeidsflate, sprak));
    },

    arbeidsflateProfil: async ({ page, urler, sprak }, use) => {
        await use(new ArbeidsflateProfilPom(page, urler.arbeidsflate, sprak));
    },

    arbeidsflateAktorer: async ({ page, urler, sprak }, use) => {
        await use(new ArbeidsflateAktorerPom(page, urler.arbeidsflate, sprak));
    },
});
