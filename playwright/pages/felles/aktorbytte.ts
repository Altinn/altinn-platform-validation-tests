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

    private drawer() {
        return this.page.locator("#header-account");
    }

    private async erApen(): Promise<boolean> {
        return (await this.drawer().getAttribute("open")) !== null;
    }

    /**
     * Lukker aktørvelgeren igjen UTEN å bytte aktør, ved å velge seg selv
     * ("Deg") — alltid et gyldig alternativ uansett hvor mange andre aktører
     * brukeren har.
     *
     * En bruker med mange aktører (som en reell DAGL med 30+
     * virksomhetsrelasjoner) lander etter innlogging med aktørvelgeren
     * allerede åpen ("Hvem vil du bruke Altinn på vegne av?"), som en
     * `<dialog aria-modal="true">` som blokkerer klikk på alt bak den —
     * blant annet cookiebanneret. Verken Escape eller et nytt klikk på
     * headerknappen (den er `disabled` mens drawer-en er åpen) lukker den
     * uten at et valg gjøres — bekreftet direkte mot at23 (testen hang i
     * 25 minutter og ventet på cookiebanneret før dette ble funnet). Se
     * minnefila for Brukermønster test-H.
     */
    async lukkHvisAutoApnet() {
        // Drawer-en dukker opp en liten stund ETTER at innloggingen selv er
        // ferdig (asynkront etter at aktørlisten er hentet), ikke med det
        // samme — en umiddelbar, ikke-ventende sjekk her rekker for det meste
        // ikke å se den, og cookiebanneret blir likevel blokkert like
        // etterpå. `waitFor` gir den sjansen til å dukke opp, uten å bruke
        // tid i det vanlige tilfellet der den aldri gjør det (få nok
        // aktører).
        try {
            await this.drawer().waitFor({ state: "visible", timeout: 5_000 });
        } catch {
            return;
        }

        await this.drawer().getByText("Deg", { exact: true }).click();
        await this.drawer().waitFor({ state: "hidden" });
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
        // Kan allerede stå åpen (se `lukkHvisAutoApnet`), f.eks. rett etter en
        // reload for en bruker med mange nok aktører til at den auto-åpnes.
        // Knappen er disabled mens den er åpen, så et unødvendig klikk her
        // ville hengt seg opp i stedet for å gjøre ingenting.
        if (!(await this.erApen())) {
            await this.knapp().click();
        }

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
