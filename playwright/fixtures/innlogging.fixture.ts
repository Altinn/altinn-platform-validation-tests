import { test as base } from '@playwright/test';
import { getTestUser, TestUser } from '../config/environment';
import { Innlogging } from '../flows/innlogging';

export const test = base.extend<{ innlogging: Innlogging; user: TestUser }>({
    innlogging: async ({ page }, use) => {
        await use(new Innlogging(page));
    },

    user: async ({ }, use) => {
        await use(getTestUser());
    },
});
