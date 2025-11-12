import { Page } from "k6/browser";

export class logoutWithUser {
    /**
    *
    * @param {Page} page
    */
    constructor(page) {
        this.page = page;
    }

    async gotoLogoutPage(logoutReportee) {
        await this.page.goto(`${__ENV.ALTINN2_BASE_URL}/ui/profile`);

        if (await this.page.getByText("Oida, denne siden kjenner vi ikke til...").isVisible()) {
            await this.page.getByRole("link", { name: "profil" }).click();
        }

        await this.page.getByRole("button", { name: logoutReportee }).click();
        await this.page.getByRole("link", { name: "Logg ut" }).click();
    }
}
