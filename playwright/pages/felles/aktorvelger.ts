import { expect, Locator, Page } from "@playwright/test";

import { Sprak } from "../../config/sprak";
import { DIALOGPORTEN_INTERVALLER, DIALOGPORTEN_TIMEOUT } from "./navigasjon";

/**
 * Aktørvelgeren som åpner seg etter innlogging når brukeren kan representere flere
 * aktører. Etter mønster fra `selectActor` i access-management-frontend sine
 * Playwright-tester (playwright/pages/LoginPage.ts).
 */
export class Aktorvelger {
    readonly dialog: Locator;
    // Knappen i headeren med aktøren brukeren står på nå, ved siden av "Meny". Headeren kan
    // vises før brukeren har valgt språk, så menyknappen utelates på alle språk.
    readonly aktorKnapp: Locator;

    constructor(private page: Page, readonly sprak: Sprak) {
        this.dialog = page.getByRole("dialog");
        this.aktorKnapp = page
            .getByRole("banner")
            .getByRole("button")
            .filter({ hasNotText: /^(meny|menu)$/i })
            .first();
    }

    /**
     * Sørger for at brukeren står på `navn`, slik en bruker som ikke vet hvor mange aktører
     * hen har, ville gjort: har aktørlisten åpnet seg av seg selv etter innlogging, velges
     * `navn` der. Står brukeren allerede på `navn`, er det ingenting å velge; det gjelder også
     * når brukeren bare har seg selv, og lista ikke dukker opp. Ellers åpnes lista fra
     * headeren, og `navn` velges direkte. Lister med søk (flere enn fem aktører) støttes ikke ennå.
     *
     * Prøves på nytt til brukeren står på `navn`. Rett etter innlogging kan lista åpne seg og
     * lukke seg igjen, og etter et språkbytte tegnes headeren på nytt, så et klikk kan bomme.
     */
    async velgAktorFraHeader(navn: string) {
        await expect(async () => {
            if (await this.dialog.isVisible()) {
                await this.aktor(navn).click({ timeout: 2_000 });
            } else if (!(await this.starPa(navn))) {
                await this.aktorKnapp.click({ timeout: 2_000 });
                await this.aktor(navn).click({ timeout: 2_000 });
            }
            await expect(this.dialog).toBeHidden({ timeout: 2_000 });
            await expect(this.aktorKnapp).toContainText(navn, { ignoreCase: true, timeout: 2_000 });
        }, `Står på ${navn}`).toPass({ timeout: 30_000 });
    }

    /**
     * Som {@link velgAktorFraHeader}, men venter til `navn` er med i lista. Etter at
     * brukeren har fått en ny fullmakt, kan det ta opptil et kvarter før aktøren
     * vises, så siden lastes på nytt og lista åpnes igjen til den er der. Lista kan
     * åpne seg av seg selv etter innlastingen, og da er knappen i headeren deaktivert.
     */
    async ventPaOgVelgAktorFraHeader(navn: string) {
        await expect(async () => {
            await this.page.reload();
            await expect(this.dialog.or(this.aktorKnapp).first()).toBeVisible();
            if (!(await this.dialog.isVisible())) {
                await this.aktorKnapp.click();
            }
            await expect(this.aktor(navn)).toBeVisible({ timeout: 5_000 });
        }, `${navn} er med i aktørlisten`).toPass({ timeout: DIALOGPORTEN_TIMEOUT, intervals: DIALOGPORTEN_INTERVALLER });
        await this.velg(navn);
    }

    private async starPa(navn: string): Promise<boolean> {
        const tekst = await this.aktorKnapp.innerText({ timeout: 2_000 });
        return tekst.toLowerCase().includes(navn.toLowerCase());
    }

    /**
     * Navnet skrives med store bokstaver i lista, og menypunktet har med fødselsdato eller
     * org.nr, så det matches uten store og små bokstaver og uten å kreve hele navnet.
     */
    private aktor(navn: string): Locator {
        const escaped = navn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return this.dialog.getByRole("menuitem", { name: new RegExp(escaped, "i") }).first();
    }

    private async velg(navn: string) {
        await this.aktor(navn).click();
        await expect(this.dialog, "Aktørlisten lukkes etter valget").toBeHidden();
        await expect(this.aktorKnapp, `Står på ${navn}`).toContainText(navn, { ignoreCase: true });
    }
}
