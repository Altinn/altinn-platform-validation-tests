import { expect, Locator, Page } from "@playwright/test";

// Appen legger instansen i urlen: #/instance/{partyId}/{instanceGuid}/...
const INSTANS_URL = /\/instance\/(\d+)\/([0-9a-f-]{36})/;

export type Instans = { partyId: string; guid: string };

/**
 * En app fra ttd, for eksempel brukermonster-test-app. `appsUrl` er `urler.apps`, og
 * `navn` appens navn i urlen.
 */
export class App {
    readonly presentationHeading: Locator;
    readonly hovedinnhold: Locator;
    readonly tilbakeTilInnboksLink: Locator;
    readonly url: string;

    constructor(
        private page: Page,
        appsUrl: string,
        readonly navn: string,
    ) {
        this.url = `${appsUrl}/${navn}/`;
        this.presentationHeading = page.getByTestId("presentation-heading");
        this.hovedinnhold = page.locator("#main-content");
        this.tilbakeTilInnboksLink = page.getByRole("link", {
            name: /^(tilbake til innboks|back to inbox)$/i,
        });
    }

    async navigateTo() {
        await this.page.goto(this.url);
    }

    async gaTilInstans({ partyId, guid }: Instans) {
        await this.page.goto(`${this.url}#/instance/${partyId}/${guid}`);
    }

    async gaTilbakeTilInnboks() {
        await this.tilbakeTilInnboksLink.click();
    }

    /** Instansen appen står på nå, lest fra urlen. */
    aktivInstans(): Instans {
        const [, partyId, guid] = this.page.url().match(INSTANS_URL) ?? [];
        if (!partyId || !guid) {
            throw new Error(`Appen står ikke på en instans: ${this.page.url()}`);
        }
        return { partyId, guid };
    }

    /** Appen viser `instans`, og ikke for eksempel en feilside eller aktørvalget. */
    async assertViserInstans({ partyId, guid }: Instans) {
        await expect(this.presentationHeading).toContainText(this.navn);
        await expect(this.page, "Står fortsatt på instansen").toHaveURL(
            new RegExp(`/instance/${partyId}/${guid}`),
        );
    }

    /**
     * Kan brukeren representere flere aktører, spør appen "Hvem vil du sende inn for?"
     * før den oppretter instansen. Da velges `aktor`. Klikket prøves på nytt til
     * instansen er opprettet, siden et klikk før lista er klar ikke gjør noe. Det er
     * urlen som avgjør: appen viser overskriften også mens den laster, før den
     * eventuelt sender brukeren til aktørvalget.
     */
    async velgAktorHvisSpurt(aktor: string) {
        const aktorKnapp = this.page.getByRole("button", { name: new RegExp(aktor, "i") });

        await expect(async () => {
            if (await aktorKnapp.isVisible()) {
                await aktorKnapp.click();
            }
            await expect(this.page).toHaveURL(INSTANS_URL, { timeout: 3_000 });
        }, "Appen har opprettet instansen").toPass({ timeout: 20_000 });
    }
}
