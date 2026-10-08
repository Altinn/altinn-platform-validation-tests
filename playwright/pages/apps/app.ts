import { expect, Locator, Page } from "@playwright/test";

import { Testapp, TestUser } from "../../config/environment";
import { Sprak } from "../../config/sprak";

// Appen legger instansen i urlen: #/instance/{partyId}/{instanceGuid}/...
const INSTANS = "/instance/";

export type Instans = { partyId: string; guid: string };

// Tekstene er fra app-frontend-react (src/language/texts), og tjenesteeieren fra altinn-orgs.json.
const TILBAKE_TIL_INNBOKS: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Tilbake til innboks",
    [Sprak.Nynorsk]: "Tilbake til innboks",
    [Sprak.Engelsk]: "Back to inbox",
};
const FOR: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "for",
    [Sprak.Nynorsk]: "for",
    [Sprak.Engelsk]: "for",
};
const TTD: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Testdepartementet",
    [Sprak.Nynorsk]: "Testdepartementet",
    [Sprak.Engelsk]: "Test Ministry",
};

// Appen viser navnet slik det står i Folkeregisteret, og rekkefølgen på delene er ikke alltid
// den samme som i testdataene, så navnet matches med delene i hvilken som helst rekkefølge.
function navnIAppen({ name }: TestUser): string {
    const rekkefolger = (deler: string[]): string[][] =>
        deler.length <= 1 ? [deler] : deler.flatMap((del, i) => rekkefolger([...deler.slice(0, i), ...deler.slice(i + 1)]).map((rest) => [del, ...rest]));
    const deler = name.split(" ").map((del) => del.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return `(?:${rekkefolger(deler).map((r) => r.join(" ")).join("|")})`;
}

/**
 * En app fra ttd, for eksempel brukermonster-test-app. `appsUrl` er `urler.apps`.
 */
export class App {
    readonly presentationHeading: Locator;
    readonly hovedinnhold: Locator;
    readonly tilbakeTilInnboksLink: Locator;
    readonly header: Locator;
    readonly url: string;
    readonly tjenesteeier: string;
    readonly visningsnavn: string;

    constructor(
        private page: Page,
        appsUrl: string,
        testapp: Testapp,
        private sprak: Sprak,
    ) {
        this.visningsnavn = testapp.visningsnavn;
        this.url = `${appsUrl}/${testapp.id}/`;
        this.tjenesteeier = TTD[sprak];
        this.presentationHeading = page.getByTestId("presentation-heading");
        this.hovedinnhold = page.locator("#main-content");
        this.header = page.getByRole("banner");
        this.tilbakeTilInnboksLink = page.getByRole("link", { name: TILBAKE_TIL_INNBOKS[sprak], exact: true });
    }

    async navigateTo() {
        await this.page.goto(this.url);
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
        await expect(this.presentationHeading).toContainText(this.visningsnavn);
        await expect(this.page, "Står fortsatt på instansen").toHaveURL(
            (url) => url.href.includes(`${INSTANS}${partyId}/${guid}`),
        );
    }

    /** Appen har opprettet instansen og står på den. */
    async assertPaInstans() {
        await expect(this.page, "Appen har opprettet instansen").toHaveURL((url) => url.href.includes(INSTANS), { timeout: 20_000 });
    }

    /** Headeren viser at `bruker` fyller ut på vegne av `aktor`: "<bruker> for <aktør>". */
    async assertPaVegneAv(bruker: TestUser, aktor: TestUser) {
        await expect(this.header, `${bruker.name} fyller ut på vegne av ${aktor.name}`).toContainText(
            new RegExp(`${navnIAppen(bruker)} ${FOR[this.sprak]} ${navnIAppen(aktor)}`, "i"),
        );
    }
}
