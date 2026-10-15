import { test as base } from "@playwright/test";

import { ApiClient } from "../clients";
import { Urler } from "../config/environment";

export const apiFixture = base.extend<{
    api: ApiClient;
    urler: Urler;
}>({
    urler: [{} as Urler, { option: true }],

    api: async ({ request, urler }, use) => {
        await use(new ApiClient(request, urler));
    },
});
