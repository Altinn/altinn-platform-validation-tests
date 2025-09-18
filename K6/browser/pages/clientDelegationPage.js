import { Locator, Page } from 'k6/browser';
import { expect } from "../../commonImports.js"

export class ClientDelegationPage {
    /**
    *
    * @param {Page} page
    */
    constructor(page) {
        this.page = page;
        this.confirmButton = page.getByRole('button', { name: 'Godkjenn systemtilgang' });
        this.addCustomersButton = page.getByRole('button', { name: 'Legg til kunder' });
        this.modifyCustomersButton = page.getByRole('button', { name: 'Legg til eller fjern kunder' });
        this.confirmAndCloseButton = page.getByRole('button', { name: 'Bekreft og lukk' });
        this.deleteSystemAccessButtons = page.getByRole('button', { name: 'Slett systemtilgang' });
        this.clientSearchBox = page.getByRole('searchbox', { name: 'Søk etter kunde' });
    }
    /**
    * @param {string} name
    * @returns {Locator}
    */
    systemUserLink(name) {
        return this.page.getByRole('link', { name });
    }
    /**
    * @param {string} name
    * @returns {Locator}
    */
    addCustomerButtonByName(name) {
        return this.page.getByRole('button', { name: `Legg til ${name}` });
    }
    /**
    * @param {string} name
    * @returns {Locator}
    */
    removeCustomerButtonByName(name) {
        return this.page.getByRole('button', { name: `Fjern ${name} fra systemtilgang` });
    }
    /**
    * @param {string} text
    * @returns {Locator}
    */
    confirmationText(text) {
        return this.page.getByText(text);
    }
    /**
    * @param {string} accessPackage
    */
    async confirmAndCreateSystemUser(accessPackage) {
        const button = this.page.getByRole('button', { name: accessPackage });
        expect(button).toBeVisible();
        await expect(this.confirmButton).toBeHidden();
        await this.confirmButton.click();
    }

    /**
    * @param {string} accessPackage
    */
    async openAccessPackage(accessPackage) {
        const button = this.page.getByRole('button', { name: accessPackage });
        await expect(button).toBeHidden(); // the button was supposed to be visible but it's actually hidden
        await button.click();
        await this.page.keyboard.press('Escape');
    }

    /**
    * @param {string} customerLabel
    * @param {string} confirmationText
    * @param {string} orgnummer
    */
    async addCustomer(
        customerLabel,
        confirmationText,
        orgnummer,
    ) {
        await expect(this.addCustomersButton).toBeVisible();
        await this.addCustomersButton.click();

        // Customers have different sorting per environment, so most consistent option is to search
        await this.clientSearchBox.fill(orgnummer);

        // Add customer
        const customerButton = this.addCustomerButtonByName(customerLabel);
        await expect(customerButton).toBeVisible();
        await this.addCustomerButtonByName(customerLabel).click();

        // Verify customer was added
        const confirmation = this.confirmationText(`${confirmationText} er lagt`);
        await expect(confirmation).toBeVisible();

        // Close customers modal
        await expect(this.confirmAndCloseButton).toBeVisible();
        await this.confirmAndCloseButton.click();
    }
    /**
    * @param {string} name
    */
    async removeCustomer(name) {
        // Open the modify customers modal
        await expect(this.modifyCustomersButton).toBeVisible();
        await this.modifyCustomersButton.click();

        // Find and click the remove button for the specified customer
        const removeButton = this.removeCustomerButtonByName(name);
        await expect(removeButton).toBeVisible();
        await this.removeCustomerButtonByName(name).click();

        // Verify the customer removal confirmation text is visible and click it
        const confirmation = this.confirmationText(`${name} er fjernet fra Systemtilgangen`);
        await expect(confirmation).toBeVisible();
        // await this.confirmationText(`${name} er fjernet fra Systemtilgangen`).click();

        // Close the customers modal after removal
        await expect(this.confirmAndCloseButton).toBeVisible();
        await this.confirmAndCloseButton.click();
    }

    /**
    * @param {string} name
    */
    async deleteSystemUser(name) {
        const deleteButton = this.deleteSystemAccessButtons.first();
        await expect(deleteButton).toBeVisible();
        await deleteButton.click();

        // Same id on both delete buttons, have to use indexes
        const confirmDeleteButton = this.deleteSystemAccessButtons.nth(1);
        await expect(confirmDeleteButton).toBeVisible();

        // Should close modal and take you back to overview page
        await Promise.all([
            await confirmDeleteButton.click(),
            this.page.waitForNavigation({ url: __ENV.SYSTEMUSER_URL }),
        ]);

        await expect(this.page.url()).toContain(__ENV.SYSTEMUSER_URL);
        const isVisible = await this.systemUserLink(name).isVisible();
        expect(isVisible).toBeFalsy();
    }
}
