import { test as base } from '@playwright/test';
import { Cookiebanner } from '../pages/felles/cookiebanner';

/**
 * Cookiebanneret hører ikke til én flate, det er det samme banneret overalt.
 * Derfor ligger det som en egen fixture og ikke under et hovedområde.
 */
export const test = base.extend<{ cookiebanner: Cookiebanner }>({
    cookiebanner: async ({ page }, use) => {
        await use(new Cookiebanner(page));
    },
});
