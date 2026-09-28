import { test as base } from "@playwright/test";

import { Urler } from "../config/environment";
import { Innlogging } from "../pages/felles/innlogging";

export const innloggingFixture = base.extend<{
    innlogging: Innlogging;
    urler: Urler;
    mockporten: boolean;
}>({
    urler: [{} as Urler, { option: true }],
    mockporten: [false, { option: true }],

    innlogging: async ({ page, mockporten, urler }, use) => {
        await use(new Innlogging(page, urler.platform, mockporten));
    },
});
