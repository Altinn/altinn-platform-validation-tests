import { Page } from "@playwright/test";
import { SsoFlow } from "../flows/sso-flow";

export class TestContext {
    currentArea?: string;
}

export class App {
    ssoFlow: SsoFlow;
    testContext: TestContext;

    constructor(page: Page) {
        this.ssoFlow = new SsoFlow(page);
        this.testContext = new TestContext();
    }
}