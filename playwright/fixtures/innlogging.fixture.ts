import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { Aktorvelger } from "../pages/felles/aktorvelger";
import { Innlogging } from "../pages/felles/innlogging";

export const innloggingFixture = base.extend<{
    innlogging: Innlogging;
    aktorvelger: Aktorvelger;
    urler: Urler;
    mockporten: boolean;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    mockporten: [false, { option: true }],
    sprak: ["" as Sprak, { option: true }],

    innlogging: async ({ page, mockporten, urler, sprak }, use) => {
        await use(new Innlogging(page, urler, mockporten, sprak));
    },

    aktorvelger: async ({ page, sprak }, use) => {
        await use(new Aktorvelger(page, sprak));
    },
});
