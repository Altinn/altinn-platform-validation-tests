import { test as base } from "@playwright/test";

import { AppsApiClient } from "../clients/apps";
import { StorageApiClient } from "../clients/storage";
import { Urler } from "../config/environment";

export const apiFixture = base.extend<{
    appsApi: AppsApiClient;
    storageApi: StorageApiClient;
    urler: Urler;
}>({
    urler: [{} as Urler, { option: true }],

    appsApi: async ({ request, urler }, use) => {
        await use(new AppsApiClient(request, urler.apps));
    },

    storageApi: async ({ request, urler }, use) => {
        await use(new StorageApiClient(request, urler.platform));
    },
});
