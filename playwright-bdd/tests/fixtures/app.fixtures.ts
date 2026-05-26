import { test as base, createBdd } from 'playwright-bdd';
import { AuthFlow } from '../flows/AuthFlow';
import { Assertions } from '../assertions/Assertions';

export class TestContext {
    currentArea?: string;
}

type Fixtures = {
    authFlow: AuthFlow;
    assertions: Assertions;
    testContext: TestContext;
};

export const test = base.extend<Fixtures>({
    authFlow: async ({ page }, use) => {
        const authFlow = new AuthFlow(page);

        await use(authFlow);
    },
    assertions: async ({ page }, use) => {
        await use(new Assertions(page));
    },
    testContext: async ({ }, use) => {
        await use(new TestContext());
    },
});

export const { Given, When, Then } = createBdd(test);