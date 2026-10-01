import { expect, Locator, Page } from "@playwright/test";

import { TestUser } from "../../config/environment";
import { Cookiebanner } from "../felles/cookiebanner";
import { Meny } from "../felles/meny";
import { assertFlateUtlogget } from "../felles/utlogget";

// Brukes også av `Innlogging`, så stien står ett sted.
export const tilgangsstyringUrl = (tilgangsstyring: string) => `${tilgangsstyring}/accessmanagement/ui`;

export class TilgangsstyringForside {
    readonly url: string;

    // Lenkene i sidemenyen finnes på href, som er den samme uansett språk. Navnet
    // får en teller når brukeren har ubehandlede forespørsler, og sidemenyen har
    // ingen test-id-er. Stiene er fra amUIPath i tilgangsstyring.
    readonly sidemeny: Locator;
    readonly foresporslerLink: Locator;
    readonly brukereLink: Locator;
    readonly fullmakterLink: Locator;
    readonly fullmakterHosAndreLink: Locator;
    readonly samtykkeOgFullmaktsavtalerLink: Locator;

    constructor(
        private page: Page,
        tilgangsstyring: string,
        readonly meny = new Meny(page),
        readonly cookiebanner = new Cookiebanner(page),
    ) {
        this.url = tilgangsstyringUrl(tilgangsstyring);

        this.sidemeny = page.getByRole("complementary");
        // Lenken i sidemenyen til en side i tilgangsstyring, gitt stien etter
        // /accessmanagement/ui/, for eksempel "users" for Brukere.
        const sidemenyLenkeTil = (sti: string) => this.sidemeny.locator(`a[href="/accessmanagement/ui/${sti}"]`);
        this.foresporslerLink = sidemenyLenkeTil("requests");
        this.brukereLink = sidemenyLenkeTil("users");
        this.fullmakterLink = sidemenyLenkeTil("poa-overview");
        this.fullmakterHosAndreLink = sidemenyLenkeTil("received-from");
        this.samtykkeOgFullmaktsavtalerLink = sidemenyLenkeTil("consent/active");
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

        await expect(this.brukereLink, "Tilgangsstyringens sidemeny vises").toBeVisible();
    }

}
