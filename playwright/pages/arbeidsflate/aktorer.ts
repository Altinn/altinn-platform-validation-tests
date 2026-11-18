import { expect, Locator, Page } from "@playwright/test";

import { Sprak } from "../../config/sprak";
import { escapeRegex } from "../../helpers/regex";
import { MenyPom } from "../felles/meny";

// Fra dialogporten-frontend (packages/frontend/src/i18n/resources): sidebar.profile.parties,
// profile.add_favorite og profile.remove_favorite. {name} er navnet på aktøren.
const OVERSKRIFT: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Aktører og favoritter",
    [Sprak.Nynorsk]: "Aktørar og favorittar",
    [Sprak.Engelsk]: "Actors and favourites",
};
const LEGG_TIL_FAVORITT: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Legg til {name} som favorittaktør",
    [Sprak.Nynorsk]: "Legg til {name} som favorittaktør",
    [Sprak.Engelsk]: "Add {name} as favourite actor",
};
const FJERN_FAVORITT: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Fjern {name} som favorittaktør",
    [Sprak.Nynorsk]: "Fjern {name} som favorittaktør",
    [Sprak.Engelsk]: "Remove {name} as favourite actor",
};

// Org.nr. slik lista viser det, i grupper på tre: "310 672 726". Uten `orgnr` matches alle
// org.nr. `\b` hindrer treff inne i et lengre tall.
const orgnrRegex = (orgnr?: string) =>
    new RegExp(`\\b${(orgnr?.match(/\d{3}/g) ?? ["\\d{3}", "\\d{3}", "\\d{3}"]).join("\\s")}\\b`);
const ORGNR = orgnrRegex();

// Teksten med hvilket som helst navn, og navnet som første gruppe.
const malRegex = (mal: string) => new RegExp(`^${mal.split("{name}").map(escapeRegex).join("(.+)")}$`);

/**
 * Det tilgjengelige navnet til `knapp`, slik Playwright regner det ut når knappen finnes på
 * rollen, enten det kommer fra aria-label, aria-labelledby eller synlig tekst. Første linje i
 * ariaSnapshot er YAML: `- button "navn"`, i enkle anførselstegn når navnet har kolon i seg.
 */
async function tilgjengeligNavn(knapp: Locator): Promise<string | undefined> {
    let linje = (await knapp.ariaSnapshot()).split("\n")[0].replace(/^- /, "").replace(/:$/, "");
    if (linje.startsWith("'")) {
        linje = linje.slice(1, -1).replace(/''/g, "'");
    }
    const sitert = linje.match(/^button (".*")$/)?.[1];
    return sitert ? JSON.parse(sitert) : undefined;
}

/** En virksomhet i lista. Org.nr. er bare sifrene, og skiller den fra underenhetene, som har samme navn. */
export type Virksomhet = { orgnr: string; navn: string };

/**
 * "Aktører og favoritter" i profilen, /profile/parties. Hver aktør har en rad med en
 * hjerteknapp, og navnet på knappen sier om aktøren er favoritt. Siden finnes bare for
 * brukere som kan representere flere enn seg selv; ellers sendes de tilbake til /profile.
 */
export class ArbeidsflateAktorerPom {
    readonly url: string;
    readonly overskrift: Locator;

    // Radene i hovedinnholdet. Underenhetene har i dag sine egne rader ved siden av hovedenheten,
    // men lå de inne i raden til hovedenheten, ville den ytre raden ha knappene deres også. Derfor
    // brukes bare rader som ikke har andre rader inni seg.
    private readonly rader: Locator;

    private readonly leggTilFavorittRegex: RegExp;
    private readonly fjernFavorittRegex: RegExp;

    // Hjerteknappene, uten å være avgrenset til hovedinnholdet, så de kan brukes inne i en rad.
    private readonly leggTilFavorittKnapp: Locator;
    private readonly fjernFavorittKnapp: Locator;

    constructor(
        private page: Page,
        arbeidsflate: string,
        readonly sprak: Sprak,
        readonly meny = new MenyPom(page),
    ) {
        this.url = `${arbeidsflate}/profile/parties`;
        this.overskrift = page.getByRole("heading", { name: OVERSKRIFT[sprak], level: 1 });
        this.rader = page.getByRole("main").getByRole("listitem").filter({ hasNot: page.getByRole("listitem") });

        this.leggTilFavorittRegex = malRegex(LEGG_TIL_FAVORITT[sprak]);
        this.fjernFavorittRegex = malRegex(FJERN_FAVORITT[sprak]);
        this.leggTilFavorittKnapp = page.getByRole("button", { name: this.leggTilFavorittRegex });
        this.fjernFavorittKnapp = page.getByRole("button", { name: this.fjernFavorittRegex });
    }

    /**
     * Raden til virksomheten. En underenhet har samme navn som hovedenheten, men sitt eget
     * org.nr., så raden finnes på det. En favoritt kan stå både under Favoritter og under
     * Virksomheter, og da er første treff nok.
     */
    rad({ orgnr }: Virksomhet): Locator {
        return this.rader.filter({ hasText: orgnrRegex(orgnr) }).first();
    }

    async navigateTo() {
        await this.page.goto(this.url, { waitUntil: "commit" });
    }

    async assertLoggedIn() {
        await this.meny.assertLoggedIn();

        // En bruker som bare har seg selv, sendes til /profile, så stien sjekkes også.
        await expect
            .poll(() => new URL(this.page.url()).pathname, { message: "Er på Aktører og favoritter" })
            .toBe(new URL(this.url).pathname);
        await expect(this.overskrift, "Overskriften vises").toBeVisible();
    }

    /** Den første virksomheten i lista som ikke er favoritt. */
    async forsteVirksomhetSomIkkeErFavoritt(): Promise<Virksomhet> {
        const rad = this.rader
            .filter({ has: this.leggTilFavorittKnapp })
            .filter({ hasText: ORGNR })
            .first();
        await expect(rad, "Brukeren har en virksomhet som ikke er favoritt").toBeVisible();

        const orgnr = (await rad.innerText()).match(ORGNR)?.[0].replace(/\D/g, "");
        const knappenavn = await tilgjengeligNavn(rad.locator(this.leggTilFavorittKnapp));
        const navn = knappenavn?.match(this.leggTilFavorittRegex)?.[1];
        if (!orgnr || !navn) {
            throw new Error(`Fant ikke org.nr. og navn i raden: "${await rad.innerText()}"`);
        }
        return { orgnr, navn };
    }

    async leggTilFavoritt(virksomhet: Virksomhet) {
        await this.rad(virksomhet).locator(this.leggTilFavorittKnapp).click();
    }

    async fjernFavoritt(virksomhet: Virksomhet) {
        await this.rad(virksomhet).locator(this.fjernFavorittKnapp).click();
    }

    async assertErFavoritt(virksomhet: Virksomhet) {
        const rad = this.rad(virksomhet);
        await expect(rad.filter({ has: this.fjernFavorittKnapp }), `${virksomhet.navn} er favoritt`).toBeVisible();
        await expect(rad.filter({ has: this.leggTilFavorittKnapp }), `${virksomhet.navn} kan ikke legges til igjen`).toBeHidden();
    }

    async assertErIkkeFavoritt(virksomhet: Virksomhet) {
        const rad = this.rad(virksomhet);
        await expect(rad.filter({ has: this.leggTilFavorittKnapp }), `${virksomhet.navn} er ikke favoritt`).toBeVisible();
        await expect(rad.filter({ has: this.fjernFavorittKnapp }), `${virksomhet.navn} kan ikke fjernes`).toBeHidden();
    }
}
