import { Page } from "@playwright/test";
import { LoginPage } from "../pages/login-page";
import { ArbeidsFlate } from "../pages/arbeidsflate/arbeidsflate";
import { MenuPage } from "../pages/menu-page";
import { ArbeidsFlateProfil } from "../pages/arbeidsflate/arbeidsflate-profil";
import { InfoPortalen } from "../pages/infoportal/infoportalen";
import { TilgangsStyring } from "../pages/access_management/tilgangsstyring";

export class SsoFlow {

    constructor(
        protected page: Page,
        protected loginPage = new LoginPage(page),
        protected menuPage = new MenuPage(page),
        protected arbeidsflate = new ArbeidsFlate(page),
        protected arbeidsflateProfil = new ArbeidsFlateProfil(page),
        protected infoPortalen = new InfoPortalen(page),
        protected tilgangsStyring = new TilgangsStyring(page)

    ) {
    }

    async login(user: { pid: string; name: string }) {
        if (!this.page.url().includes('idporten')) {
            await this.menuPage.clickLoginButton();
        }
        await this.loginPage.loginWithTestUser(user);
    }

    async logout(area: string, user: { pid: string; name: string }) {
        if (area === 'infoportalen') {
            // sikre at vi er på infoportalen
            await this.infoPortalen.navigateTo();
            await this.infoPortalen.assertOnPage(user);
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

    async checkSectionsAreVisible(area: string, sections: string[]) {
        switch (area) {
            case 'tilgangsstyring':
                await this.tilgangsStyring.checkSectionsAreVisible(sections);
                break;
            default:
                throw new Error(`Ukjent område: ${area}`);
        }
    }

    async setLanguage(language: string) {
        await this.menuPage.setLanguage(language);
    }
}