import { Page } from "@playwright/test";
import { Assertions } from "../assertions/Assertions";
import { AuthFlow } from "../flows/AuthFlow";

export class TestContext {
    currentArea?: string;
}

export class App {
    auth: AuthFlow;
    assertions: Assertions;
    testContext: TestContext;

    constructor(page: Page) {
        this.auth = new AuthFlow(page);
        this.assertions = new Assertions(page);
        this.testContext = new TestContext();
    }
}