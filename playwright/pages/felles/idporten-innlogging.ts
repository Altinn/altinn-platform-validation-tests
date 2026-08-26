import { expect, Page } from "@playwright/test";
import { TestUser } from "../../config/environment";

/**
 * Innlogging med TestID hos ID-porten, altså gjennom skjermbildene en bruker
 * møter. Brukes av testene der selve innloggingsflyten er det som testes.
 */
export class IdportenInnlogging {
    constructor(private page: Page) { }

    async login(user: TestUser) {
        await this.page.locator('#testid1').click();
        await this.page.locator('input[name="pid"]').fill(user.pid);
        await this.page.locator('#submit').click();
    }

    /**
     * Sjekker på URLen og ikke på TestID-knappen, siden prod-innloggingen viser
     * de ekte ID-porten-valgene og ikke testbruker-knappen.
     */
    async assertOnPage() {
        await expect(this.page, 'Er sendt til ID-porten-innlogging').toHaveURL(/idporten/);
    }
}
