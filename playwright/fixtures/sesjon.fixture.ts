import { BrowserContext, Page, test as base } from "@playwright/test";

import { TestAppConfig, Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { AppPom } from "../pages/apps/app";
import { ArbeidsflateForsidePom } from "../pages/arbeidsflate/forside";
import { AktorvelgerPom } from "../pages/felles/aktorvelger";
import { InnloggingPom } from "../pages/felles/innlogging";
import { TilgangsstyringForsidePom } from "../pages/tilgangsstyring/forside";

/** En egen nettleserøkt, med sine egne cookies, ved siden av testens `page`. */
export type Sesjon = {
    page: Page;
    innlogging: InnloggingPom;
    aktorvelger: AktorvelgerPom;
    app: AppPom;
    arbeidsflate: ArbeidsflateForsidePom;
    tilgangsstyring: TilgangsstyringForsidePom;
};

export const sesjonFixture = base.extend<{
    nySesjon: () => Promise<Sesjon>;
    urler: Urler;
    mockporten: boolean;
    testAppConfig: TestAppConfig;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    mockporten: [false, { option: true }],
    testAppConfig: [{} as TestAppConfig, { option: true }],
    sprak: ["" as Sprak, { option: true }],

    // For tester med flere brukere: hver bruker logger inn i sin egen økt, så ingen
    // arver noe fra den forrige. Den nye konteksten får projectets enhetsinnstillinger,
    // og lukkes når testen er ferdig.
    nySesjon: async ({ browser, urler, mockporten, testAppConfig, sprak, viewport }, use) => {
        const kontekster: BrowserContext[] = [];

        await use(async () => {
            const kontekst = await browser.newContext({ viewport });
            kontekster.push(kontekst);
            const page = await kontekst.newPage();
            return {
                page,
                innlogging: new InnloggingPom(page, urler, mockporten, sprak),
                aktorvelger: new AktorvelgerPom(page, sprak),
                app: new AppPom(page, urler.apps, testAppConfig, sprak),
                arbeidsflate: new ArbeidsflateForsidePom(page, urler.arbeidsflate, sprak),
                tilgangsstyring: new TilgangsstyringForsidePom(page, urler.tilgangsstyring, sprak),
            };
        });

        await Promise.all(kontekster.map((kontekst) => kontekst.close()));
    },
});
