import { BrowserContext, Page, test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { Aktorvelger } from "../pages/felles/aktorvelger";
import { Innlogging } from "../pages/felles/innlogging";

/** En egen nettleserøkt, med sine egne cookies, ved siden av testens `page`. */
export type Sesjon = {
    page: Page;
    innlogging: Innlogging;
    aktorvelger: Aktorvelger;
};

export const sesjonFixture = base.extend<{
    nySesjon: () => Promise<Sesjon>;
    urler: Urler;
    mockporten: boolean;
}>({
    urler: [{} as Urler, { option: true }],
    mockporten: [false, { option: true }],

    // For tester med flere brukere: hver bruker logger inn i sin egen økt, så ingen
    // arver noe fra den forrige. Den nye konteksten får projectets enhetsinnstillinger,
    // og lukkes når testen er ferdig.
    nySesjon: async ({ browser, urler, mockporten }, use) => {
        const kontekster: BrowserContext[] = [];

        await use(async () => {
            const kontekst = await browser.newContext();
            kontekster.push(kontekst);
            const page = await kontekst.newPage();
            return {
                page,
                innlogging: new Innlogging(page, urler, mockporten),
                aktorvelger: new Aktorvelger(page),
            };
        });

        await Promise.all(kontekster.map((kontekst) => kontekst.close()));
    },
});
