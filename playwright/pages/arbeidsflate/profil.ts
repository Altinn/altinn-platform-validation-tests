import { expect, Locator, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Sprak } from "../../config/sprak";
import { CookiebannerPom } from "../felles/cookiebanner";
import { MenyPom } from "../felles/meny";
import { assertFlateUtlogget } from "../felles/utlogget";

// Fra dialogporten-frontend (packages/frontend/src/i18n/resources), profile.settings.heading
// og profile.settings.address.
const OVERSKRIFT: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Dine innstillinger i Altinn",
    [Sprak.Nynorsk]: "Dine innstillingar i Altinn",
    [Sprak.Engelsk]: "Your settings in Altinn",
};
const ADRESSE: Record<Sprak, string> = {
    [Sprak.Bokmaal]: "Adresse",
    [Sprak.Nynorsk]: "Adresse",
    [Sprak.Engelsk]: "Address",
};

const escape = (tekst: string) => tekst.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class ArbeidsflateProfilPom {
    readonly url: string;
    readonly overskrift: Locator;
    readonly hovedinnhold: Locator;
    // Adressen under Din profil. Knappen heter "Adresse" fulgt av adressen.
    readonly adresseButton: Locator;

    // Lenkene i profilens sidemeny. href-ene er språkuavhengige.
    readonly lagredeSokLink: Locator;
    // Finnes bare for brukere som kan representere flere enn seg selv.
    readonly aktorerLink: Locator;

    constructor(
        private page: Page,
        arbeidsflate: string,
        readonly sprak: Sprak,
        readonly meny = new MenyPom(page),
        readonly cookiebanner = new CookiebannerPom(page),
    ) {
        this.url = `${arbeidsflate}/profile`;
        this.overskrift = page.getByRole("heading", { name: OVERSKRIFT[sprak], level: 1 });
        this.hovedinnhold = page.getByRole("main");
        this.adresseButton = this.hovedinnhold.getByRole("button", { name: new RegExp(`^${ADRESSE[sprak]} `) });

        const sidemeny = page.getByRole("complementary");
        this.lagredeSokLink = sidemeny.locator("a[href=\"/profile/saved-searches\"]");
        this.aktorerLink = sidemeny.locator("a[href=\"/profile/parties\"]");
    }

    async navigateTo() {
        await this.page.goto(this.url, { waitUntil: "commit" });
    }

    async gaTilAktorer() {
        await this.aktorerLink.click();
    }

    // Flatene bak innlogging svarer likt for en utlogget bruker, så påstanden
    // ligger i `assertFlateUtlogget`.
    async assertLoggedOut(user: TestUser) {
        await assertFlateUtlogget(this.page, user);
    }

    async assertLoggedIn() {
        await this.meny.assertLoggedIn();

        // Sidemenyen alene skiller ikke profilen fra innboksen: lagrede søk-lenken
        // finnes i begge. Stien sjekkes, så query-parametre ikke gir falsk feil.
        await expect
            .poll(() => new URL(this.page.url()).pathname, { message: "Er på profilen" })
            .toBe(new URL(this.url).pathname);

        await expect(this.lagredeSokLink, "Profilens sidemeny vises").toBeVisible();
    }

    /**
     * Profilen viser innstillingene til `user`, med navnet fra Register. Navnet kan stå med
     * eller uten mellomnavn og med andre store og små bokstaver enn i testdataene, så
     * fornavn og etternavn matches hver for seg.
     */
    async assertViserBruker(user: TestUser) {
        await expect(this.overskrift, "Overskriften vises").toBeVisible();
        await expect(this.hovedinnhold, `Profilen viser navnet til ${user.name}`)
            .toContainText(new RegExp(`${escape(user.firstName)}.*${escape(user.lastName)}`, "i"));
    }

    /**
     * Profilen viser `postadresse`, slik Profil har den fra Folkeregisteret. Siden skriver
     * postnummer og poststed en gang til etter et komma, så det sjekkes at adressen står der.
     */
    async assertViserPostadresse(postadresse: string) {
        await expect(this.adresseButton, `Profilen viser postadressen ${postadresse}`).toContainText(postadresse);
    }
}
