import { test as base, createBdd } from 'playwright-bdd';
import { App } from '../app/app';

type Fixtures = {
    app: App;
};

export const test = base.extend<Fixtures>({
    app: async ({ page }, use) => {
        await use(new App(page));
    },
});

export const { Given, When, Then } = createBdd(test);