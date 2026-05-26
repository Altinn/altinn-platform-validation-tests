import { test as base, createBdd } from 'playwright-bdd';
import { AuthFlow } from '../flows/AuthFlow';

type Fixtures = {
    authFlow: AuthFlow;
};

export const test = base.extend<Fixtures>({
    authFlow: async ({ page }, use) => {
        const authFlow = new AuthFlow(page);

        await use(authFlow);
    },
});

export const { Given, When, Then } = createBdd(test);