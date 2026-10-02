import { expect, Page } from "@playwright/test";

/**
 * "Brukere"-siden i tilgangsstyring, der en tilgangsstyrer for en virksomhet
 * legger til personer og gir dem tilgangspakker. Flyten og selektorene under
 * er verifisert direkte mot at23: logget inn som en reell daglig leder
 * (dagligLeder-testdata), byttet til virksomheten sin, og gått gjennom "Ny
 * bruker" → "Legg til person" → "Gi fullmakt" → søk på pakke.
 *
 * Testbrukeren som ble lagt til i verifiseringen ble fjernet igjen etterpå
 * («Slett bruker» → «Ja, slett»), så den flyten er også verifisert.
 */
export class TilgangsstyringBrukere {
    readonly url: string;

    constructor(private page: Page, tilgangsstyring: string) {
        this.url = `${tilgangsstyring}/accessmanagement/ui/users`;
    }

    async navigateTo() {
        await this.page.goto(this.url, { waitUntil: "commit" });
    }

    /**
     * Legger til en ny person som bruker av den valgte virksomheten, og lander
     * på personens side med 0 tilgangspakker. `etternavn` må stemme med
     * folkeregisteret, ellers holder ikke skjemaet knappen aktivert.
     */
    async leggTilPerson(fodselsnummer: string, etternavn: string) {
        await this.page.getByRole("button", { name: "Ny bruker" }).click();
        await this.page.getByLabel(/Fødselsnummer\/brukernavn/i).fill(fodselsnummer);
        await this.page.getByLabel(/Etternavn/i).fill(etternavn);

        const leggTil = this.page.getByRole("button", { name: "Legg til person" });
        await expect(leggTil, "Legg til person er aktivert").toBeEnabled();
        await leggTil.click();

        await expect(
            this.page.getByRole("heading", { name: "Fullmakt til 0 tilgangspakker" }),
            "Personen er lagt til uten tilgangspakker",
        ).toBeVisible();
    }

    /**
     * Åpner en person som allerede er lagt til, fra oversikten over brukere
     * med fullmakter for virksomheten.
     */
    async apnePerson(navn: string) {
        await this.page.getByRole("link", { name: new RegExp(navn, "i") }).click();
    }

    /**
     * Gir personen en tilgangspakke. `sokeord` er det tilgangspakke-søket
     * finner pakken på (kategorinavnet matcher ikke alltid pakkenavnet), mens
     * `pakkenavn` er den synlige knappe-/kort-teksten å klikke "Gi fullmakt"
     * ved siden av.
     *
     * Søkefeltet finnes to ganger i DOM-et (mobil/desktop-variant), og bare
     * det andre (index 1) er faktisk koblet til filtreringen i denne
     * oppsettet — det første ser ut til å være en skjult duplikat.
     */
    async giTilgangspakke(sokeord: string, pakkenavn: string) {
        await this.page.getByRole("button", { name: "Gi fullmakt" }).first().click();

        const sokefelt = this.page.getByPlaceholder("Søk etter tilgangspakker");
        await sokefelt.nth(1).fill(sokeord);

        const pakkekort = this.page.getByText(pakkenavn, { exact: true }).locator("xpath=ancestor::*[.//button[text()='Gi fullmakt']][1]");
        await pakkekort.getByRole("button", { name: "Gi fullmakt" }).click();

        // Tildelingen bekreftes av kalleren via antallTilgangspakker(), som er
        // det som faktisk ble verifisert i en reell testkjøring (telleren gikk
        // fra 0 til 1). Et forsøk på å lese en bekreftelsestekst her inne i
        // panelet var upålitelig og er derfor droppet.
    }

    /**
     * Antall tilgangspakker personen har fått, lest fra overskriften
     * "Fullmakt til N tilgangspakker" på personens side.
     */
    async antallTilgangspakker(): Promise<number> {
        const tekst = await this.page.getByText(/Fullmakt til \d+ tilgangspakke/).textContent();
        const match = tekst?.match(/\d+/);
        return match ? Number(match[0]) : 0;
    }

    /**
     * Fjerner personen fullstendig fra virksomheten. Brukes i opprydding: en
     * feilet test skal ikke la Person B stå igjen med tilgang.
     *
     * Navigerer friskt til personens side via oversikten istedenfor å anta at
     * siden fortsatt står der fra et tidligere steg. I Brukermønster test-H
     * går det flere minutter (ventingen på at person B dukker opp i
     * aktørlisten) mellom tildelingen og oppryddingen, og en side som har
     * stått urørt så lenge er ikke til å stole på.
     */
    async slettPerson(navn: string) {
        await this.navigateTo();
        await this.apnePerson(navn);
        await this.page.getByRole("button", { name: "Slett bruker" }).click();
        await this.page.getByRole("button", { name: "Ja, slett" }).click();
    }
}
