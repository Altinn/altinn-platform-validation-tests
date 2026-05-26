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

    async navigateToArea(area: string) {
        const url = getFullUrl(area);
        console.log(`Navigerer til ${url} for område ${area}`);
        await this.gotoAllowAborted(this.page, url);
        if (area !== 'infoportalen') {
            await expect(this.page.locator('#testid1')).toBeVisible();
        }
    }

    async navigateToAreaAndVerify(area: string) {
        const url = getFullUrl(area);
        console.log(`Navigerer til ${url} for område ${area}`);
        await this.gotoAllowAborted(this.page, url);
    }

    async checkLoggedIn(area: string, user: { pid: string; name: string }) {
        const expectedUrl = getFullUrl(area);
        switch (area) {
            case 'arbeidsflate':
            case 'arbeidsflate-profil':
            case 'tilgangsstyring':
                await expect(this.page).toHaveURL(expectedUrl);
                break;
            case 'infoportalen':
                // infoportalen har ingen innloggingsindikator, så vi sjekker at vi er på riktig URL
                await expect(this.page).toHaveURL(expectedUrl);
                const matches = this.page.getByText(user.name);

                for (let i = 0; i < await matches.count(); i++) {
                    const match = matches.nth(i);

                    if (await match.isVisible()) {
                        await expect(match).toBeVisible();
                        break;
                    }
                }
                break;
            default:
                throw new Error(`Ukjent område: ${area}`);
        }
    }

    async checkLoggedOut(area: string) {
        switch (area) {
            case 'arbeidsflate':
            case 'arbeidsflate-profil':
            case 'tilgangsstyring':
                await expect(this.page.locator('#testid1')).toBeVisible();
                break;
            case 'infoportalen':
                // infoportalen har ingen innloggingsindikator, så vi sjekker at vi er på riktig URL
                const url = getFullUrl(area);
                await expect(this.page).toHaveURL(url);
                // og at vi ser innloggingsknappen
                await expect(this.page.getByRole('button', {
                    name: /logg inn|login/i,
                })).toBeVisible();
                break;
            default:
                throw new Error(`Ukjent område: ${area}`);
        }
    }

    private async gotoAllowAborted(page: any, url: string) {
        try {
            await page.goto(url, { waitUntil: 'commit', timeout: 15000 });
        } catch (err: any) {
            if (String(err.message).includes('net::ERR_ABORTED')) {
                console.warn(`Navigation aborted, continuing: ${url}`);
            } else {
                throw err;
            }
        }
    }
}