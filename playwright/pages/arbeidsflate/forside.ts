import { expect, Locator, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Sprak } from "../../config/sprak";
import { Instans } from "../apps/app";
import { Cookiebanner } from "../felles/cookiebanner";
import { Meny } from "../felles/meny";
import { DIALOGPORTEN_INTERVALLER, DIALOGPORTEN_TIMEOUT } from "../felles/navigasjon";
import { assertFlateUtlogget } from "../felles/utlogget";

// Fra altinn-dialogporten-adapter (StorageDialogportenDataMerger), som lager dialogene for app-instansene.
const GA_TIL_SKJEMAUTFYLLING: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Gå til skjemautfylling",
    [Sprak.Nynorsk]: "Gå til skjemautfylling",
    [Sprak.Engelsk]: "Go to form completion",
};

export class ArbeidsflateForside {
    // Utkast-lenken i sidemenyen finnes bare på innboksen, og href-en er den
    // samme uansett språk.
    readonly utkastLink: Locator;
    readonly gaTilSkjemautfyllingLink: Locator;

    /**
     * Lenken til dialogen for `instans` i lista. Dialog-id-en er guid-en til instansen med et
     * nytt tidsstempel foran (ToVersion7 i altinn-dialogporten-adapter), så siste ledd er likt.
     */
    dialogLink({ guid }: Instans): Locator {
        return this.page.getByRole("main").locator(`a[href*="${guid.split("-").at(-1)}"]`);
    }

    constructor(
        private page: Page,
        readonly url: string,
        readonly sprak: Sprak,
        readonly meny = new Meny(page),
        readonly cookiebanner = new Cookiebanner(page),
    ) {
        this.utkastLink = page.getByRole("complementary").locator("a[href=\"/drafts\"]");
        this.gaTilSkjemautfyllingLink = page.getByRole("link", { name: GA_TIL_SKJEMAUTFYLLING[sprak] });
    }

    /** Åpner instansen i appen fra dialogsiden i innboksen. */
    async gaTilSkjemautfylling() {
        await this.gaTilSkjemautfyllingLink.click();
    }

    async apneUtkast() {
        await this.utkastLink.click();
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
