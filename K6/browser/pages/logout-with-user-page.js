/**
 * @typedef {import("k6/browser").Page} Page
 */

import { requireEnv } from "../../helpers.js";

export class logoutWithUser {
    /**
     *
     * @param {Page} page TODO: description
     */
    constructor(page) {
        requireEnv(["ALTINN2_BASE_URL"]);
        this.page = page;
    }

    /**
     * @param {string} logoutReportee Name of the reportee to log out from.
     * @returns {Promise<void>} Resolves once logout was submitted.
     */
    async gotoLogoutPage(logoutReportee) {
        await this.page.goto(`${__ENV.ALTINN2_BASE_URL}/ui/profile`);

        if (await this.page.getByText("Oida, denne siden kjenner vi ikke til...").isVisible()) {
            await this.page.getByRole("link", { name: "profil" }).click();
        }

        await this.page.getByRole("button", { name: logoutReportee }).click();
        await this.page.getByRole("link", { name: "Logg ut" }).click();
    }
}
