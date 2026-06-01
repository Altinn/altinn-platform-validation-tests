import { expect, Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { getFullUrl } from "../common-functions";
import { MenuPage } from "../pages/MenuPage";

export class AuthFlow {

    constructor(
        private page: Page,
        private loginPage = new LoginPage(page),
        private menuPage = new MenuPage(page),
    ) {
    }

    async login(user: { pid: string; name: string }) {
        if (!this.page.url().includes('idporten')) {
            await this.loginPage.clickLoginButton();
        }

        await this.loginPage.selectTestUser();
        await this.loginPage.fillPid(user.pid);
        await this.loginPage.submit();
    }

    async logout(area: string) {
        if (area === 'infoportalen') {
            await this.gotoAllowAborted(this.page, getFullUrl(area));
        }
        await this.menuPage.clickMenuButton();
        await this.menuPage.clickLogoutButton();
    }

    async navigateToAreaAndVerifyOnLogin(area: string) {
        const url = getFullUrl(area);
        await this.gotoAllowAborted(this.page, url);
        if (area !== 'infoportalen') {
            await expect(this.page.locator('#testid1')).toBeVisible();
        }
    }

    async navigateToArea(area: string) {
        const url = getFullUrl(area);
        await this.gotoWithRetry(this.page, url);
    }

    async refresh() {
        await this.page.reload();
    }

    async refreshWithGoto() {
        await this.page.goto(this.page.url(), {
            waitUntil: 'domcontentloaded'
        });
    }

    async pause(arg0: number) {
        await this.page.waitForTimeout(arg0);
    }

    private async gotoAllowAborted(page: any, url: string) {
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch (err: any) {
            if (String(err.message).includes('net::ERR_ABORTED')) {
                console.warn(`Navigation aborted, continuing: ${url}`);
            } else {
                throw err;
            }
        }
    }


    private async gotoWithRetry(
        page: Page,
        url: string,
        maxAttempts = 3
    ): Promise<void> {

        let lastError: unknown;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {

            try {

                await page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 15000,
                });

                return;

            } catch (error) {

                const message =
                    error instanceof Error
                        ? error.message
                        : String(error);

                if (!message.includes('net::ERR_ABORTED')) {
                    throw error;
                }

                lastError = error;

                console.warn(
                    `Navigation aborted (${attempt}/${maxAttempts}): ${url}`
                );

                if (attempt < maxAttempts) {
                    await page.waitForTimeout(1000);
                }
            }
        }

        throw new Error(`Navigation to ${url} failed after ${maxAttempts} attempts: ${lastError}`);
    }
}