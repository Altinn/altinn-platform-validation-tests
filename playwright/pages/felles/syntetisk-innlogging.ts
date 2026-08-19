import { expect, Page } from "@playwright/test";
import { baseUrls, requireEnv, TestUser } from "../../config/environment";

/**
 * Innlogging som syntetisk testbruker, uten å gå gjennom ID-porten.
 *
 * Alt som er spesielt for mekanismen er samlet her: Altinn Authentication ruter
 * til en syntetisk-only upstream når `iss` er med i login-URLen, og der fylles et
 * skjema med et delt tilgangspassord og et syntetisk Tenor-fnr (måned 81-92).
 * Resten av kodebasen skal ikke trenge å kjenne til det.
 */
export class SyntetiskInnlogging {
    constructor(private page: Page) { }

    /**
     * Logger inn og lander på URLen som ble sendt inn. Flyten må starte på Altinns
     * login-endepunkt slik at `state` opprettes serverside; en authorize-URL kan
     * ikke bygges her eller gjenbrukes.
     */
    async login(targetUrl: string, user: TestUser) {
        await this.page.goto(loginUrl(targetUrl));

        await expect(this.pidField(), 'Er på innloggingsskjemaet').toBeVisible();
        await this.passwordField().fill(sharedPassword());
        await this.pidField().fill(user.pid);
        await this.page.getByRole('button', { name: /log in as test user/i }).click();
    }

    private passwordField() {
        return this.page.getByLabel(/shared access password/i);
    }

    private pidField() {
        return this.page.getByLabel(/fødselsnummer/i);
    }
}

function loginUrl(targetUrl: string): string {
    const goto = encodeURIComponent(targetUrl);
    return `${baseUrls.platform}/authentication/api/v1/authentication?goto=${goto}&iss=mockporten`;
}

/**
 * Det delte tilgangspassordet. Tjenesten låser seg globalt etter fem feilforsøk,
 * så testen skal feile umiddelbart framfor å prøve seg fram.
 */
function sharedPassword(): string {
    return requireEnv('TEST_IDP_PASSWORD');
}
