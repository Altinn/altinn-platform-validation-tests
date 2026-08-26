/**
 * @typedef {import("k6/browser").Locator} Locator
 * @typedef {import("k6/browser").Page} Page
 */

import { expect } from "../../common-imports.js";
import { requireEnv } from "../../helpers.js";

export class LoginPage {
    /**
     *
     * @param {Page} page TODO: description
     */
    constructor(page) {
        requireEnv(["ALTINN2_BASE_URL"]);
        this.page = page;
        this.searchBox = this.page.getByRole("searchbox", { name: "Søk etter aktør" });
        this.pidInput = this.page.locator("input[name='pid']");
        this.testIdLink = this.page.getByRole("link", { name: "TestID Lag din egen" });
        this.loginButton = this.page.getByRole("button", { name: "Logg inn", exact: true });
        this.profileLink = this.page.getByRole("link", { name: "profil" });
        this.velgAktoerHeading = this.page.getByRole("heading", { level: 1, name: "Velg aktør" });
        this.autentiserButton = this.page.getByRole("button", { name: "Autentiser" });
    }

    /**
     * @param {string} testUser Person identifier to sign in as.
     * @returns {Promise<void>} Resolves once the actor picker is showing.
     */
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
                    throw new Error("Login failed after 3 retries");
                }
                await this.page.waitForTimeout(2000 * attempt);
            }
        }
    }

    /**
     * @param {string} pid Person identifier to sign in as.
     * @returns {Promise<void>} Resolves once authentication was submitted.
     */
    async loginNotChoosingActor(pid) {
        await this.testIdLink.click();
        await this.pidInput.fill(pid);
        await this.autentiserButton.click();
    }

    /**
     * @param {string} pid Person identifier to sign in as.
     * @param {string} orgnummer Organisation number of the actor to pick.
     * @returns {Promise<void>} Resolves once that actor has been picked.
     */
    async loginAs(pid, orgnummer) {
        const baseUrl = __ENV.ALTINN2_BASE_URL;
        await this.page.goto(baseUrl);
        await this.loginButton.click();
        await this.testIdLink.click();
        await this.pidInput.fill(pid);
        await this.autentiserButton.click();

        await expect(this.velgAktoerHeading).toBeVisible();
        await this.selectActor(this.searchBox, orgnummer);
    }

    /**
     * @param {string} reportee Name of the reportee to act as.
     * @returns {Promise<void>} Resolves once that reportee's profile is showing.
     */
    async chooseReportee(reportee) {
        const chosenReportee = this.page.getByRole("button").filter({ hasText: reportee });
        await chosenReportee.click();

        await this.page.goto(`${__ENV.ALTINN2_BASE_URL}/ui/profile`);
        await this.profileLink.click();

        const profileHeader = this.page.getByRole("heading", {
            name: new RegExp(
                `Profil for (.*${reportee}.*|.*${reportee.split(" ").reverse().join(" ")}.*)`,
                "i",
            ),
        });
        await expect(profileHeader).toBeVisible();
    }

    /**
     * @returns {Promise<void>} Resolves on the TestID login page.
     */
    async navigateToLoginPage() {
        await this.page.goto(__ENV.ALTINN2_BASE_URL);
        await this.loginButton.click();
        await this.testIdLink.click();
    }

    /**
     * @param {string} pid Person identifier to authenticate as.
     * @returns {Promise<void>} Resolves once authentication was submitted.
     */
    async authenticateUser(pid) {
        await this.pidInput.fill(pid);
        await this.autentiserButton.click();
    }

    /**
     * @returns {Promise<void>} Resolves once the actor picker is showing.
     */
    async verifyLoginSuccess() {
        await expect(this.velgAktoerHeading).toBeVisible();
    }

    /**
     * @param {Locator} input The actor search box.
     * @param {string} orgnummer Organisation number of the actor to pick.
     * @returns {Promise<void>} Resolves once that actor has been picked.
     */
    async selectActor(input, orgnummer) {
        const aktorPartial = `${orgnummer.slice(0, 3)} ${orgnummer.slice(3, 6)}`;
        const button = this.page.getByRole("button", { name: new RegExp(`Org\\.nr\\. ${aktorPartial}`) });

        try {
            await this.tryTypingInSearchbox(input, orgnummer);
            await expect(button).toBeVisible({ timeout: 2000 }); // No need to wait long to figure out if this failed
        } catch (error) {
            console.log(`Retrying input after reload due to: ${error}`);
            await this.tryTypingInSearchbox(input, orgnummer);
        }

        await button.click();
    }

    /**
     * @param {Locator} input The actor search box.
     * @param {string} party What to type into it.
     * @returns {Promise<void>} Resolves once it has been typed.
     */
    async tryTypingInSearchbox(input, party) {
        await expect(input).toBeVisible();
        await expect(input).toBeEnabled();
        await input.click();
        await input.clear();
        await input.type(party, { "delay": 10 });
    }
}
