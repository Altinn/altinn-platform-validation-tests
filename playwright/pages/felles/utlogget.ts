import { expect, Page } from "@playwright/test";

import { TestUser } from "../../config/testdata";
import { REDIRECT_TIMEOUT } from "./navigasjon";

/**
 *
 * @param page Siden som skal være utlogget.
 * @param user Brukeren som var innlogget, og hvis navn ikke skal vises lenger.
 */
export async function assertFlateUtlogget(page: Page, user: TestUser) {
    await expect(
        page.getByRole("banner"),
        "Siden har rendret en hovednavigasjon",
    ).toBeVisible({ timeout: REDIRECT_TIMEOUT });

    await expect(
        page.getByText(user.name).first(),
        "Brukerens navn vises ikke",
    ).toBeHidden({ timeout: REDIRECT_TIMEOUT });
}
