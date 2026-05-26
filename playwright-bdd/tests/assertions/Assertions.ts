import { expect, Page } from "@playwright/test";
import { getFullUrl } from "../common-functions";

export class Assertions {
    constructor(private page: Page) { }

    async checkLoggedIn(area: string, user: { pid: string; name: string }) {
        const expectedUrl = getFullUrl(area);
        switch (area) {
            case 'arbeidsflate':
            case 'arbeidsflate-profil':
            case 'tilgangsstyring':
                await expect(this.page).toHaveURL(expectedUrl);
                break;
            case 'infoportalen':
                // infoportalen har ingen innloggingsindikator, så vi sjekker at vi er på riktig URL
                await expect(this.page).toHaveURL(expectedUrl);
                const matches = this.page.getByText(user.name);

                for (let i = 0; i < await matches.count(); i++) {
                    const match = matches.nth(i);

                    if (await match.isVisible()) {
                        await expect(match).toBeVisible();
                        break;
                    }
                }
                break;
            default:
                throw new Error(`Ukjent område: ${area}`);
        }
    }


    async checkLoggedOut(area: string) {
        switch (area) {
            case 'arbeidsflate':
            case 'arbeidsflate-profil':
            case 'tilgangsstyring':
                await expect(this.page.locator('#testid1')).toBeVisible();
                break;
            case 'infoportalen':
                // infoportalen har ingen innloggingsindikator, så vi sjekker at vi er på riktig URL
                const url = getFullUrl(area);
                await expect(this.page).toHaveURL(url);
                // og at vi ser innloggingsknappen
                await expect(this.page.getByRole('button', {
                    name: /logg inn|login/i,
                })).toBeVisible();
                break;
            default:
                throw new Error(`Ukjent område: ${area}`);
        }
    }
}
