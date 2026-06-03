import { expect, Page } from "@playwright/test";
import { getFullUrl } from "../common-functions";
import { LoginPage } from "../pages/LoginPage";
import { ArbeidsFlate } from "../pages/arbeidsflate/ArbeidsFlate";
import { MenuPage } from "../pages/MenuPage";
import { ArbeidsFlateProfil } from "../pages/arbeidsflate/ArbeidsFlateProfil";
import { InfoPortalen } from "../pages/Infoportalen";
import { TilgangsStyring } from "../pages/TilgangsStyring";

export class SsoFlow {

    constructor(
        private page: Page,
        private loginPage = new LoginPage(page),
        private menuPage = new MenuPage(page),
        private arbeidsflate = new ArbeidsFlate(page),
        private arbeidsflateProfil = new ArbeidsFlateProfil(page),
        private infoPortalen = new InfoPortalen(page),
        private tilgangsStyring = new TilgangsStyring(page)

    ) {
    }

    async login(user: { pid: string; name: string }) {
        if (!this.page.url().includes('idporten')) {
            await this.menuPage.clickLoginButton();
        }
        await this.loginPage.loginWithTestUser(user);
    }

    async logout(area: string) {
        if (area === 'infoportalen') {
            // sikre at vi er på infoportalen
            await this.infoPortalen.navigateTo();
        }
        await this.menuPage.clickMenuButton();
        await this.menuPage.clickLogoutButton();
    }

    async navigateToAreaAndVerifyOnLogin(area: string) {
        await this.navigateToArea(area);
        if (area !== 'infoportalen') {
            await this.loginPage.verifyOnPage();
        }
    }

    async navigateToArea(area: string) {
        switch (area) {
            case 'arbeidsflate':
                await this.arbeidsflate.navigateTo();
                break;
            case 'arbeidsflate-profil':
                await this.arbeidsflateProfil.navigateTo();
                break;
            case 'tilgangsstyring':
                await this.tilgangsStyring.navigateTo();
                break;
            case 'infoportalen':
                await this.infoPortalen.navigateTo();
                break;
            default:
                throw new Error(`Ukjent område: ${area}`);
        }
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

    async checkLoggedIn(area: string, user: { pid: string; name: string }) {
        switch (area) {
            case 'arbeidsflate':
                await this.arbeidsflate.assertOnPage();
                break;
            case 'arbeidsflate-profil':
                await this.arbeidsflateProfil.assertOnPage();
                break;
            case 'tilgangsstyring':
                await this.tilgangsStyring.assertOnPage();
                break;
            case 'infoportalen':
                await this.infoPortalen.assertOnPage(user);
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
                await this.loginPage.verifyOnPage();
                break;
            case 'infoportalen':
                await this.infoPortalen.assertLoggedOut();
                break;
            default:
                throw new Error(`Ukjent område: ${area}`);
        }
    }
}