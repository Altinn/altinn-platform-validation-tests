import { expect, Page } from "@playwright/test";

/**
 * Aktørbytteren i toppmenyen, felles for alle flatene. Den viser navnet til
 * hvem som helst er valgt som aktør, og har `data-color="company"` uansett om
 * den valgte aktøren er en person eller en virksomhet, mens menyknappen ved
 * siden av ikke har noe `aria-label`. Det er det som skiller dem.
 *
 * Selve byttet er verifisert direkte mot at23: `aria-label` på knappen endrer
 * seg til navnet på virksomheten etter et bytte, og bytting via cookie alene
 * (uten et faktisk klikk gjennom søkefeltet) later bare som om det virker —
 * serveren beholder den forrige aktøren helt til søket og klikket er gjort.
 */
export class Aktorbytte {
    constructor(private page: Page) { }

    private knapp() {
        return this.page.getByRole("banner").locator("button[data-color='company']").first();
    }

    /**
     * Finner den synlige blant flere like treff. Flere steder i denne appen
     * rendrer samme felt to ganger (en mobil-/desktopvariant), der bare én av
     * dem faktisk er synlig — både søkefeltet her og i tilgangspakke-søket i
     * TilgangsstyringBrukere. `.first()` plukker DOM-rekkefølgen, som ikke er
     * stabil på tvers av brukere, derfor sjekkes synlighet eksplisitt.
     */
    private async forsteSynlige(locator: ReturnType<Page["getByPlaceholder"]>) {
        const antall = await locator.count();

        for (let i = 0; i < antall; i++) {
            if (await locator.nth(i).isVisible()) {
                return locator.nth(i);
            }
        }

        throw new Error("Fant ingen synlig match blant kandidatene");
    }

    /**
     * Bytter til virksomheten med det gitte organisasjonsnummeret. Søker på
     * organisasjonsnummeret siden det gir ett unikt treff, og klikker på
     * treffet på navnet siden det er det som er synlig i resultatlisten.
     *
     * Søkefeltets placeholder er ikke stabil på tvers av brukere: "Søk i
     * aktører" for en bruker med virksomheter i listen, men bare "Søk ..." for
     * en bruker uten noen (som Person B før delegeringen) — verifisert direkte
     * mot at23 for begge. Matcher derfor bare prefikset "Søk".
     */
    async byttTilVirksomhet(orgnr: string, navn: string) {
        await this.knapp().click();

        const sokefelt = await this.forsteSynlige(this.page.getByPlaceholder(/^Søk/));
        await sokefelt.fill(orgnr);

        await expect(
            this.page.getByText(navn, { exact: false }).first(),
            `Søket finner ${navn}`,
        ).toBeVisible();
        await this.page.getByText(navn, { exact: false }).first().click();
        await expect(this.knapp(), `Aktørbytteren viser ${navn}`).toHaveAttribute("aria-label", navn, { ignoreCase: true });
    }
}
