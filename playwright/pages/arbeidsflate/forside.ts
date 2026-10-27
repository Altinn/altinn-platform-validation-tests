import { expect, Locator, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Sprak } from "../../config/sprak";
import { Melding } from "../../helpers/meldinger";
import { Instans } from "../apps/app";
import { CookiebannerPom } from "../felles/cookiebanner";
import { MenyPom } from "../felles/meny";
import { DIALOGPORTEN_INTERVALLER, DIALOGPORTEN_TIMEOUT } from "../felles/navigasjon";
import { assertFlateUtlogget } from "../felles/utlogget";

// Fra altinn-dialogporten-adapter (StorageDialogportenDataMerger), som lager dialogene for app-instansene.
const GA_TIL_SKJEMAUTFYLLING: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Gå til skjemautfylling",
    [Sprak.Nynorsk]: "Gå til skjemautfylling",
    [Sprak.Engelsk]: "Go to form completion",
};
// Fra altinn-correspondence (CreateDialogRequestMapper), som legger bekreftelsen på dialogen.
const BEKREFT: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Bekreft",
    [Sprak.Nynorsk]: "Bekreft",
    [Sprak.Engelsk]: "Confirm",
};
// Fra dialogporten-frontend (packages/frontend/src/i18n/resources).
const AKTIVITETSLOGG: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Aktivitetslogg",
    [Sprak.Nynorsk]: "Aktivitetslogg",
    [Sprak.Engelsk]: "Activity log",
};
// activity.status.correspondence_opened og correspondence_confirmed, uten "{actor}" foran.
const APNET_MELDINGEN: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "åpnet meldingen.",
    [Sprak.Nynorsk]: "opna meldinga.",
    [Sprak.Engelsk]: "opened the message.",
};
const BEKREFTET_MELDINGEN: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "bekreftet meldingen.",
    [Sprak.Nynorsk]: "stadfesta meldinga.",
    [Sprak.Engelsk]: "confirmed the message.",
};

export class ArbeidsflateForsidePom {
    // Utkast-lenken i sidemenyen finnes bare på innboksen, og href-en er den
    // samme uansett språk.
    readonly utkastLink: Locator;
    readonly sendtLink: Locator;
    readonly gaTilSkjemautfyllingLink: Locator;

    // Dialogsiden, /inbox/{dialogId}.
    readonly dialog: Locator;
    readonly bekreftButton: Locator;
    readonly aktivitetsloggButton: Locator;
    readonly aktivitetslogg: Locator;

    /**
     * Lenken til dialogen for `instans` i lista. Dialog-id-en er guid-en til instansen med et
     * nytt tidsstempel foran (ToVersion7 i altinn-dialogporten-adapter), så siste ledd er likt.
     */
    dialogLink({ guid }: Instans): Locator {
        return this.page.getByRole("main").locator(`a[href*="${guid.split("-").at(-1)}"]`);
    }

    /** Lenken til dialogen for `melding` i lista, funnet på den unike tittelen. */
    meldingLink({ tittel }: Melding): Locator {
        return this.page.getByRole("main").getByRole("link", { name: tittel });
    }

    constructor(
        private page: Page,
        readonly url: string,
        readonly sprak: Sprak,
        readonly meny = new MenyPom(page),
        readonly cookiebanner = new CookiebannerPom(page),
    ) {
        this.utkastLink = page.getByRole("complementary").locator("a[href=\"/drafts\"]");
        this.sendtLink = page.getByRole("complementary").locator("a[href=\"/sent\"]");
        this.gaTilSkjemautfyllingLink = page.getByRole("link", { name: GA_TIL_SKJEMAUTFYLLING[sprak] });
        this.dialog = page.getByRole("main").getByRole("article");
        this.bekreftButton = this.dialog.getByRole("button", { name: BEKREFT[sprak], exact: true });
        this.aktivitetsloggButton = this.dialog.getByRole("button", { name: AKTIVITETSLOGG[sprak], exact: true });
        this.aktivitetslogg = page.getByRole("dialog");
    }

    /** Åpner instansen i appen fra dialogsiden i innboksen. */
    async gaTilSkjemautfylling() {
        await this.gaTilSkjemautfyllingLink.click();
    }

    async apneUtkast() {
        await this.utkastLink.click();
    }

    async apneSendt() {
        await this.sendtLink.click();
    }

    /**
     * Venter til dialogen for `instans` står i lista. Dialogporten lager dialogen litt etter at
     * appen har opprettet instansen, og lista oppdaterer seg ikke selv, så den lastes på nytt.
     */
    async ventPaDialog(instans: Instans) {
        await expect(async () => {
            await this.page.reload();
            await expect(this.dialogLink(instans)).toBeVisible({ timeout: 5_000 });
        }, `Instansen ${instans.guid} står i lista`).toPass({ timeout: DIALOGPORTEN_TIMEOUT, intervals: DIALOGPORTEN_INTERVALLER });
    }

    /**
     * Dialogen for `instans` står i lista innen 3 sekunder. Som `ventPaDialog`, men for når
     * dialogen skal være der med en gang: lista lastes på nytt i tilfelle Dialogporten
     * er litt etter, men uten den lange `DIALOGPORTEN_TIMEOUT`.
     */
    async assertDialog(instans: Instans) {
        await expect(async () => {
            await this.page.reload();
            await expect(this.dialogLink(instans)).toBeVisible({ timeout: 1_000 });
        }, `Instansen ${instans.guid} står i lista`).toPass({ timeout: 15_000, intervals: [1000] });
    }

    /**
     * Venter til `melding` står i lista. Correspondence publiserer meldingen og Dialogporten
     * lager dialogen etter at den er sendt, så lista lastes på nytt til den er der. I at23 tok
     * det rundt ett sekund.
     */
    async ventPaMelding(melding: Melding) {
        await expect(async () => {
            await this.page.reload();
            await expect(this.meldingLink(melding)).toBeVisible({ timeout: 3_000 });
        }, `Meldingen "${melding.tittel}" står i lista`).toPass({ timeout: 60_000, intervals: [2_000] });
    }

    async apneMelding(melding: Melding) {
        await this.meldingLink(melding).click();
    }

    /**
     * Dialogsiden viser `melding` med innholdet. Innholdet hentes fra Correspondence først når
     * dialogen er åpnet (front channel embed), så det kan komme noen sekunder etter tittelen.
     */
    async assertViserMelding(melding: Melding) {
        await expect(this.dialog.getByRole("heading", { level: 2 }).first(), "Dialogen for meldingen er åpnet").toHaveText(melding.tittel);
        await expect(this.dialog, "Innholdet i meldingen er hentet fra Correspondence").toContainText(melding.tekst, { timeout: 20_000 });
    }

    async bekreftMelding() {
        await this.bekreftButton.click();
    }

    /**
     * "Bekreft" forsvinner når innboksen har tatt imot bekreftelsen, og aktivitetsloggen viser at
     * `bruker` har bekreftet meldingen når Correspondence har registrert det. Det tar noen
     * sekunder, og først da kan meldingen slettes.
     */
    async assertMeldingBekreftetAv(bruker: TestUser) {
        await expect(this.bekreftButton, "Meldingen er bekreftet").toBeHidden();
        await this.assertIAktivitetsloggen(`${bruker.name} ${BEKREFTET_MELDINGEN[this.sprak]}`);
    }

    /** Aktivitetsloggen på dialogsiden viser at `bruker` har åpnet meldingen. */
    async assertMeldingApnetAv(bruker: TestUser) {
        await this.assertIAktivitetsloggen(`${bruker.name} ${APNET_MELDINGEN[this.sprak]}`);
    }

    /** Aktivitetsloggen oppdaterer seg ikke selv, så dialogsiden lastes på nytt til `tekst` står der. */
    private async assertIAktivitetsloggen(tekst: string) {
        await expect(async () => {
            await this.page.reload();
            await this.aktivitetsloggButton.click();
            await expect(this.aktivitetslogg).toContainText(tekst, { timeout: 1_000 });
        }, `Aktivitetsloggen viser "${tekst}"`).toPass({ timeout: 15_000, intervals: [2_000] });
    }

    async navigateTo() {
        await this.page.goto(this.url, { waitUntil: "commit" });
    }

    // Flatene bak innlogging svarer likt for en utlogget bruker, så påstanden
    // ligger i `assertFlateUtlogget`.
    async assertLoggedOut(user: TestUser) {
        await assertFlateUtlogget(this.page, user);
    }

    async assertLoggedIn() {
        await this.meny.assertLoggedIn();

        await expect(this.utkastLink, "Innboksens sidemeny vises").toBeVisible();
    }
}
