import { expect, Locator, Page } from "@playwright/test";

// Appen legger instansen i urlen: #/instance/{partyId}/{instanceGuid}/...
const INSTANS = "/instance/";

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

    async gaTilInstans({ partyId, guid }: Instans) {
        await this.page.goto(`${this.url}#${INSTANS}${partyId}/${guid}`);
    }

    async gaTilbakeTilInnboks() {
        await this.tilbakeTilInnboksLink.click();
    }

    /** Instansen appen står på nå, lest fra urlen. */
    aktivInstans(): Instans {
        const [partyId, guid] = this.page.url().split(INSTANS)[1]?.split("/") ?? [];
        if (!partyId || !guid) {
            throw new Error(`Appen står ikke på en instans: ${this.page.url()}`);
        }
        return { partyId, guid };
    }

    /** Appen viser `instans`, og ikke for eksempel en feilside eller aktørvalget. */
    async assertViserInstans({ partyId, guid }: Instans) {
        await expect(this.presentationHeading).toContainText(this.navn);
        await expect(this.page, "Står fortsatt på instansen").toHaveURL(
            (url) => url.href.includes(`${INSTANS}${partyId}/${guid}`),
        );
    }

    /** Appen har opprettet instansen og står på den. */
    async assertPaInstans() {
        await expect(this.page, "Appen har opprettet instansen").toHaveURL((url) => url.href.includes(INSTANS), { timeout: 20_000 });
    }
}
