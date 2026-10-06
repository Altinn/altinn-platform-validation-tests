import { expect, Locator, Page } from "@playwright/test";

import { Sprak } from "../../config/sprak";

/**
 * Teksten på Brukere-undersiden oversettes, i motsetning til sidemenyen (som er
 * på href). Verifisert mot AT23 i alle tre språk, se #622.
 */
const NY_BRUKER: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Ny bruker",
    [Sprak.Nynorsk]: "Ny brukar",
    [Sprak.Engelsk]: "New user",
};
const FODSELSNUMMER: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Fødselsnummer/brukernavn",
    [Sprak.Nynorsk]: "Fødselsnummer/brukarnamn",
    [Sprak.Engelsk]: "SSN/username",
};
const ETTERNAVN: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Etternavn",
    [Sprak.Nynorsk]: "Etternamn",
    [Sprak.Engelsk]: "Last name",
};
const LEGG_TIL_PERSON: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Legg til person",
    [Sprak.Nynorsk]: "Legg til person",
    [Sprak.Engelsk]: "Add person",
};
const GI_FULLMAKT: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Gi fullmakt",
    [Sprak.Nynorsk]: "Gi fullmakt",
    [Sprak.Engelsk]: "Give new power of attorney",
};
const LUKK: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Lukk",
    [Sprak.Nynorsk]: "Lukk",
    [Sprak.Engelsk]: "Close",
};
const SOK_ETTER_TILGANGSPAKKER: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Søk etter tilgangspakker",
    [Sprak.Nynorsk]: "Søk etter tilgangspakkar",
    [Sprak.Engelsk]: "Search for access packages",
};

// Knappen i pakkedetaljene, scopet til ett bestemt pakkenavn via dialogen, så
// den trenger ikke matche pakkenavnet i selve knappeteksten (den varierer: noen
// ganger "Slett fullmakt for <pakke>", noen ganger bare "Slett fullmakt").
const SLETT_FULLMAKT: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Slett fullmakt",
    [Sprak.Nynorsk]: "Slett fullmakt",
    [Sprak.Engelsk]: "Delete power of attorney",
};
const GI_FULLMAKT_FOR_PAKKE: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Gi fullmakt",
    [Sprak.Nynorsk]: "Gi fullmakt",
    [Sprak.Engelsk]: "Give power of attorney",
};

function dialogTittel(sprak: Sprak, navn: string): string {
    const prefiks: Record<Sprak, string> = {
        [Sprak.Bokmaal]: `Hva skal ${navn}`,
        [Sprak.Nynorsk]: `Kva skal ${navn}`,
        [Sprak.Engelsk]: `What will ${navn}`,
    };
    return prefiks[sprak];
}

export class TilgangsstyringBrukere {
    readonly nyBrukerButton: Locator;
    readonly fodselsnummerInput: Locator;
    readonly etternavnInput: Locator;
    readonly leggTilPersonButton: Locator;
    readonly giFullmaktButton: Locator;

    constructor(private page: Page, private sprak: Sprak) {
        this.nyBrukerButton = page.getByRole("button", { name: NY_BRUKER[sprak] });
        this.fodselsnummerInput = page.getByRole("textbox", { name: FODSELSNUMMER[sprak] });
        this.etternavnInput = page.getByRole("textbox", { name: ETTERNAVN[sprak] });
        this.leggTilPersonButton = page.getByRole("button", { name: LEGG_TIL_PERSON[sprak] });
        this.giFullmaktButton = page.getByRole("button", { name: GI_FULLMAKT[sprak] });
    }

    async leggTilNyBruker(fodselsnummer: string, etternavn: string) {
        await this.nyBrukerButton.click();
        await this.fodselsnummerInput.click();
        await this.fodselsnummerInput.fill(fodselsnummer);
        await this.etternavnInput.click();
        await this.etternavnInput.fill(etternavn);
        await this.leggTilPersonButton.click();

        // UI-et går til siden for brukeren først når brukeren er lagret.
        await expect(this.giFullmaktButton, "Står på siden til den nye brukeren").toBeVisible();
    }

    /**
     * Åpner fullmaktsdialogen og navigerer til `tilgangspakke` sin detaljvisning.
     * Samme dialog brukes både for å gi fullmakten og for å lese av den etterpå,
     * det finnes ingen egen dialog for bare å vise en tilgangspakke.
     * `tilgangspakke` er det oversatte pakkenavnet (det oversettes også, ikke bare
     * UI-teksten rundt), og bare starten trengs siden søkeresultatets knapp har
     * med antall tjenester i navnet.
     */
    async apnePakkeDetaljer(navn: string, tilgangspakke: string): Promise<PakkeDetaljer> {
        await this.giFullmaktButton.click();

        const dialog = this.page.getByRole("dialog", { name: dialogTittel(this.sprak, navn) });
        const sokefelt = dialog.getByRole("searchbox", { name: SOK_ETTER_TILGANGSPAKKER[this.sprak] });
        await sokefelt.click();
        await sokefelt.fill(tilgangspakke);

        await dialog.getByRole("button", { name: new RegExp(`^${tilgangspakke}`, "i") }).click();

        return new PakkeDetaljer(dialog, this.sprak, navn, tilgangspakke);
    }
}

/** Detaljvisningen til én tilgangspakke i fullmaktsdialogen, for personen `navn`. */
export class PakkeDetaljer {
    readonly giFullmaktButton: Locator;
    readonly slettFullmaktButton: Locator;
    readonly lukkButton: Locator;

    constructor(
        private dialog: Locator,
        sprak: Sprak,
        private navn: string,
        private tilgangspakke: string,
    ) {
        this.giFullmaktButton = dialog.getByRole("button", { name: new RegExp(`^${GI_FULLMAKT_FOR_PAKKE[sprak]}`, "i") });
        this.slettFullmaktButton = dialog.getByRole("button", { name: new RegExp(`^${SLETT_FULLMAKT[sprak]}`, "i") });
        this.lukkButton = dialog.getByRole("button", { name: LUKK[sprak] });
    }

    async giFullmakt() {
        await this.giFullmaktButton.click();
    }

    async assertHarFullmakt() {
        await expect(this.slettFullmaktButton, `${this.tilgangspakke} er gitt til ${this.navn}`).toBeVisible();
    }

    async assertInneholderApp(appNavn: string) {
        await expect(
            this.dialog.getByText(appNavn),
            `${appNavn} vises som en av tjenestene i ${this.tilgangspakke}`,
        ).toBeVisible();
    }

    async lukk() {
        await this.lukkButton.click();
    }
}
