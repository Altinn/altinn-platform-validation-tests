import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { Sprak } from "../config/sprak";
import { AktorvelgerPom } from "../pages/felles/aktorvelger";
import { InnloggingPom } from "../pages/felles/innlogging";

export const innloggingFixture = base.extend<{
    innlogging: InnloggingPom;
    aktorvelger: AktorvelgerPom;
    urler: Urler;
    mockporten: boolean;
    sprak: Sprak;
}>({
    urler: [{} as Urler, { option: true }],
    mockporten: [false, { option: true }],
    sprak: ["" as Sprak, { option: true }],

    innlogging: async ({ page, mockporten, urler, sprak }, use) => {
        await use(new InnloggingPom(page, urler, mockporten, sprak));
    },

    aktorvelger: async ({ page, sprak }, use) => {
        await use(new AktorvelgerPom(page, sprak));
    },
});
