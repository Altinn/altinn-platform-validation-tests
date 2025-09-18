import { Page } from 'k6/browser';
import { expect } from "../../commonImports.js"

export class LoginPage {
    /**
    *
    * @param {Page} page
    */
    constructor(page) {
        this.page = page;
        this.searchBox = this.page.getByRole('searchbox', { name: 'Søk etter aktør' });
        this.pidInput = this.page.locator("input[name='pid']");
        this.testIdLink = this.page.getByRole('link', { name: 'TestID Lag din egen' });
        this.loginButton = this.page.getByRole('button', { name: 'Logg inn', exact: true });
        this.profileLink = this.page.getByRole('link', { name: 'profil' });
        this.velgAktoerHeading = this.page.getByRole('heading', { level: 1, name: 'Velg aktør' });
        this.autentiserButton = this.page.getByRole('button', { name: 'Autentiser' });
    }

    async loginWithUser(testUser) {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                await this.navigateToLoginPage();
                await this.authenticateUser(testUser);
                await this.verifyLoginSuccess();
                return;
            } catch (error) {
                console.log(`Login attempt ${attempt} failed with error: ${error}`);
                if (attempt === 3) {
                    throw new Error('Login failed after 3 retries');
                }
                await this.page.waitForTimeout(2000 * attempt);
            }
        }
    }

    async loginNotChoosingActor(pid) {
        await this.testIdLink.click();
        await this.pidInput.fill(pid);
        await this.autentiserButton.click();
    }

    async loginAs(pid, orgnummer) {
        const baseUrl = __ENV.ALTINN_UI_URL;
        await this.page.goto(baseUrl);
        await this.loginButton.click();
        await this.testIdLink.click();
        await this.pidInput.fill(pid);
        await this.autentiserButton.click();

        await expect(this.velgAktoerHeading).toBeVisible();
        await this.selectActor(this.searchBox, orgnummer);
    }

    async chooseReportee(reportee) {
        const chosenReportee = this.page.getByRole('button').filter({ hasText: reportee });
        await chosenReportee.click();

        await this.page.goto(`${__ENV.ALTINN_UI_URL}/ui/profile`);
        await this.profileLink.click();

        const profileHeader = this.page.getByRole('heading', {
            name: new RegExp(
                `Profil for (.*${reportee}.*|.*${reportee.split(' ').reverse().join(' ')}.*)`,
                'i',
            ),
        });
        await expect(profileHeader).toBeVisible();
    }

    async navigateToLoginPage() {
        await this.page.goto(__ENV.ALTINN_UI_URL);
        await this.loginButton.click();
        await this.testIdLink.click();
    }

    async authenticateUser(pid) {
        await this.pidInput.fill(pid);
        await this.autentiserButton.click();
    }

    async verifyLoginSuccess() {
        await expect(this.velgAktoerHeading).toBeVisible();
    }

    async selectActor(input, orgnummer) {
        const aktorPartial = `${orgnummer.slice(0, 3)} ${orgnummer.slice(3, 6)}`;
        const button = this.page.getByRole('button', { name: new RegExp(`Org\\.nr\\. ${aktorPartial}`) });

        try {
            await this.tryTypingInSearchbox(input, orgnummer);
            await expect(button).toBeVisible({ timeout: 2000 }); // No need to wait long to figure out if this failed
        } catch (error) {
            console.log(`Retrying input after reload due to: ${error}`);
            await this.tryTypingInSearchbox(input, orgnummer);
        }

        await button.click();
    }

    async tryTypingInSearchbox(input, party) {
        await expect(input).toBeVisible();
        await expect(input).toBeEnabled();
        await input.click();
        await input.clear();
        await input.type(party, { "delay": 10 });
    }
}
