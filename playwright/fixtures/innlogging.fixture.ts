import { test as base } from '@playwright/test';
import { Innlogging } from '../flows/innlogging';

export const test = base.extend<{ innlogging: Innlogging }>({
    innlogging: async ({ page }, use) => {
        await use(new Innlogging(page));
    },
});
