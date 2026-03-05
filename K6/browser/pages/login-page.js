import { Page } from "k6/browser";
import { expect } from "../../common-imports.js";

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
        this.tilgangsstyringLink = this.page.getByRole('link', { name: 'Tilgangsstyring' });
        this.testIdLinkText = this.page.getByRole('link', {
            name: /TestID Lag din egen testbruker/i,
        });
        this.newSolutionHeading = this.page.getByRole('heading', {
            name: 'Du er nå i den nye løsningen',
        });
    }

    async LoginToAccessManagement(pid) {
        await this.clickLoginToAccessManagement();
        await this.authenticateUser(pid);
    }

    async loginNotChoosingActor(pid) {
        await this.testIdLink.click();
        await this.pidInput.fill(pid);
        await this.autentiserButton.click();
    }

    async loginAcActorOrg(pid, orgnummer) {
        const baseUrl = "https://info.at22.altinn.cloud/" // TODO, update the ConfigMap https://github.com/Altinn/altinn-access-management-frontend/commit/73b872980371a4a575b8fdf879a0e40e829fe5b7#diff-3e3212c5f1e698a49e8a314e96d54ee71e968cece92f4cac381d26b57d116afa
        await this.page.goto(baseUrl);
        await this.loginButton.click();
        await this.testIdLink.click();
        await this.pidInput.fill(pid);
        await this.autentiserButton.click();

        await expect(this.velgAktoerHeading).toBeVisible();
        await this.selectActor(this.searchBox, orgnummer);
    }

    async chooseReportee(currentReportee, targetReportee = '') {
        let selectReporteeButton = this.page.getByRole('button', { name: currentReportee });

        // Search for target reportee in the searchbox
        const searchBox = this.page.getByRole('searchbox', { name: 'Søk i aktører' });
        await searchBox.fill(targetReportee);

        const markedResult = this.page
            .locator('mark')
            .filter({ hasText: new RegExp(targetReportee, 'i') });
        await markedResult.first().click();
    }

    async clickLoginToAccessManagement() {
        await this.page.getByRole('button', { name: 'Meny' }).click();
        await expect(
            this.page.getByRole('navigation', { name: 'Menu' }).getByLabel('Tilgangsstyring'),
        ).toBeVisible();
        await this.page.getByRole('navigation', { name: 'Menu' }).getByLabel('Tilgangsstyring').click();
        await this.testIdLink.click();
    }

    async authenticateUser(pid) {
        await this.pidInput.fill(pid);
        await this.autentiserButton.click();
    }

    async selectActor(input, orgnummer) {
        const page = input.page();
        const aktorPartial = `${orgnummer.slice(0, 3)} ${orgnummer.slice(3, 6)}`;
        const button = page.getByRole('button', { name: new RegExp(`Org\\.nr\\. ${aktorPartial}`) });

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
        await input.pressSequentially(party);
    }
}

export class logoutWithUser {
    constructor(page) { }

    async gotoLogoutPage(logoutReportee) {
        await this.page.goto(`${"https://info.at22.altinn.cloud/"}/ui/profile`); // TODO, update ConfigMap https://github.com/Altinn/altinn-access-management-frontend/commit/73b872980371a4a575b8fdf879a0e40e829fe5b7#diff-3e3212c5f1e698a49e8a314e96d54ee71e968cece92f4cac381d26b57d116afa

        if (await this.page.getByText('Oida, denne siden kjenner vi ikke til...').isVisible()) {
            await this.page.getByRole('link', { name: 'profil' }).click();
        }

        await this.page.getByRole('button', { name: logoutReportee }).click();
        await this.page.getByRole('link', { name: 'Logg ut' }).click();
    }
}
