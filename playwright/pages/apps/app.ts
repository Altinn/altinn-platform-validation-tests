import { expect, Locator, Page } from "@playwright/test";

import { etternavn, TestAppConfig, TestUser } from "../../config/environment";
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
const NESTE: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Neste",
    [Sprak.Nynorsk]: "Neste",
    [Sprak.Engelsk]: "Next",
};
// Fra tekstene til brukermonster-test-app. Appen har foreløpig bare bokmålsteksten, så
// nynorsk og engelsk må legges inn i appen før de språkene skrus på, se #694.
const SEND_INN: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Send inn",
    [Sprak.Nynorsk]: "Send inn",
    [Sprak.Engelsk]: "Submit",
};

// Personoppslaget (PersonLookup) i app-frontend-react.
const PERSONOPPSLAG: Record<Sprak, { fodselsnummer: string; etternavn: string; hent: string; fjern: string }> = {
    [Sprak.Bokmaal]: { fodselsnummer: "Fødselsnummer", etternavn: "Etternavn", hent: "Hent opplysninger", fjern: "Fjern" },
    [Sprak.Nynorsk]: { fodselsnummer: "Fødselsnummer", etternavn: "Etternamn", hent: "Hent opplysningar", fjern: "Fjern" },
    [Sprak.Engelsk]: { fodselsnummer: "National ID number/D-number", etternavn: "Surname", hent: "Fetch details", fjern: "Clear" },
};

// Appen står på kvitteringen når prosessen er ferdig: #/instance/{partyId}/{instanceGuid}/ProcessEnd
const KVITTERING = "/ProcessEnd";

// Appen forkorter og snur navnet («U. SILHUETT FLØYTE», «KØ KJÆRLIG»), så bare etternavnet matches.
function etternavnIAppen(bruker: TestUser): string {
    return etternavn(bruker).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * En app fra ttd, for eksempel brukermonster-test-app. `appsUrl` er `urler.apps`.
 */
export class AppPom {
    readonly presentationHeading: Locator;
    readonly hovedinnhold: Locator;
    readonly tilbakeTilInnboksLink: Locator;
    readonly nesteButton: Locator;
    readonly sendInnButton: Locator;
    readonly header: Locator;
    readonly url: string;
    readonly tjenesteeier: string;
    readonly visningsnavn: string;

    constructor(
        private page: Page,
        appsUrl: string,
        testAppConfig: TestAppConfig,
        private sprak: Sprak,
    ) {
        this.visningsnavn = testAppConfig.visningsnavn;
        this.url = `${appsUrl}/${testAppConfig.id}/`;
        this.tjenesteeier = TTD[sprak];
        this.presentationHeading = page.getByTestId("presentation-heading");
        this.hovedinnhold = page.locator("#main-content");
        this.header = page.getByRole("banner");
        this.tilbakeTilInnboksLink = page.getByRole("link", { name: TILBAKE_TIL_INNBOKS[sprak], exact: true });
        this.nesteButton = this.hovedinnhold.getByRole("button", { name: NESTE[sprak], exact: true });
        this.sendInnButton = this.hovedinnhold.getByRole("button", { name: SEND_INN[sprak], exact: true });
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

    async gaTilNesteSide() {
        await this.nesteButton.click();
    }

    /**
     * Slår opp `bruker` i personoppslaget, som er obligatorisk. Appen slår opp i Altinn
     * Register, og "Fjern" vises først når oppslaget har funnet personen.
     */
    async fyllUtPersonoppslag(bruker: TestUser) {
        const tekster = PERSONOPPSLAG[this.sprak];
        await this.hovedinnhold.getByRole("textbox", { name: tekster.fodselsnummer, exact: true }).fill(bruker.pid);
        await this.hovedinnhold.getByRole("textbox", { name: tekster.etternavn, exact: true }).fill(etternavn(bruker));
        await this.hovedinnhold.getByRole("button", { name: tekster.hent, exact: true }).click();
        await expect(
            this.hovedinnhold.getByRole("button", { name: tekster.fjern, exact: true }),
            `Personoppslaget fant ${bruker.name}`,
        ).toBeVisible();
    }

    /** Sender inn fra siste side, og appen går videre til kvitteringen. */
    async sendInn() {
        await this.sendInnButton.click();
    }

    /**
     * Appen viser kvitteringen for `instans`. Referansenummeret på kvitteringen er siste ledd
     * av guid-en, og det er det samme på alle språk.
     */
    async assertKvittering({ partyId, guid }: Instans) {
        await expect(this.page, "Appen står på kvitteringen").toHaveURL(
            (url) => url.href.includes(`${INSTANS}${partyId}/${guid}${KVITTERING}`),
        );
        await expect(this.hovedinnhold, "Kvitteringen viser referansenummeret").toContainText(guid.split("-").at(-1)!);
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
            new RegExp(`${etternavnIAppen(bruker)}.* ${FOR[this.sprak]} .*${etternavnIAppen(aktor)}`, "i"),
        );
    }
}
