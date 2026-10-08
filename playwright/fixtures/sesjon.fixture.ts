import { BrowserContext, Page, test as base } from "@playwright/test";

import { Testapp, Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { App } from "../pages/apps/app";
import { ArbeidsflateForside } from "../pages/arbeidsflate/forside";
import { Aktorvelger } from "../pages/felles/aktorvelger";
import { Innlogging } from "../pages/felles/innlogging";
import { TilgangsstyringForside } from "../pages/tilgangsstyring/forside";

/** En egen nettleserøkt, med sine egne cookies, ved siden av testens `page`. */
export type Sesjon = {
    page: Page;
    innlogging: Innlogging;
    aktorvelger: Aktorvelger;
    app: App;
    arbeidsflate: ArbeidsflateForside;
    tilgangsstyring: TilgangsstyringForside;
};

export const sesjonFixture = base.extend<{
    nySesjon: () => Promise<Sesjon>;
    urler: Urler;
    mockporten: boolean;
    testapp: Testapp;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    mockporten: [false, { option: true }],
    testapp: [{} as Testapp, { option: true }],
    sprak: ["" as Sprak, { option: true }],

    // For tester med flere brukere: hver bruker logger inn i sin egen økt, så ingen
    // arver noe fra den forrige. Den nye konteksten får projectets enhetsinnstillinger,
    // og lukkes når testen er ferdig.
    nySesjon: async ({ browser, urler, mockporten, testapp, sprak, viewport }, use) => {
        const kontekster: BrowserContext[] = [];

        await use(async () => {
            const kontekst = await browser.newContext({ viewport });
            kontekster.push(kontekst);
            const page = await kontekst.newPage();
            return {
                page,
                innlogging: new Innlogging(page, urler, mockporten, sprak),
                aktorvelger: new Aktorvelger(page, sprak),
                app: new App(page, urler.apps, testapp, sprak),
                arbeidsflate: new ArbeidsflateForside(page, urler.arbeidsflate, sprak),
                tilgangsstyring: new TilgangsstyringForside(page, urler.tilgangsstyring, sprak),
            };
        });

        await Promise.all(kontekster.map((kontekst) => kontekst.close()));
    },
});
