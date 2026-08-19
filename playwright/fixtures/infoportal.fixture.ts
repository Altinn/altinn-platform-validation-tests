import { test as base } from '@playwright/test';
import { InfoportalForside } from '../pages/infoportal/forside';

export type Infoportal = {
    forside: InfoportalForside;
};

export const test = base.extend<{ infoportal: Infoportal }>({
    infoportal: async ({ page }, use) => {
        await use({
            forside: new InfoportalForside(page),
        });
    },
});
