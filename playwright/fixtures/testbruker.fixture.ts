import { test as base, TestInfo } from "@playwright/test";

import type { TestUser } from "../config/environment";
import { getTestUser } from "../config/testdata";
import { gjeldendeMiljo } from "../miljo";
import { Testbruker } from "../testdata";

/**
 * Testpersonene, én fixture per brukergruppe i Testbruker. En test ber om den den
 * trenger ved navn, så det står i testen selv hvilke testdata den bruker:
 *
 *   test("...", async ({ innlogging, dagligLeder }) => { ... });
 *
 * Hvem hver test faktisk kjørte som står i rapporten, som annotasjonen under
 * legger inn. CSV-brukere fordeles med parallelIndex innenfor én kjøring.
 * Separate kjøringer deler brukerpool.
 */
export const test = base.extend<{ privatPerson: TestUser; dagligLeder: TestUser }>({
    /** Privatperson uten roller i en virksomhet, se testdata/privatPersonUtenVirksomhet. */
    privatPerson: async ({}, use, testInfo) => {
        await use(testperson(Testbruker.PrivatPersonUtenVirksomhet, testInfo));
    },
    /** Daglig leder i en virksomhet, se testdata/dagligLeder. */
    dagligLeder: async ({}, use, testInfo) => {
        await use(testperson(Testbruker.DagligLeder, testInfo));
    },
});

function testperson(gruppe: Testbruker, testInfo: TestInfo): TestUser {
    const bruker = getTestUser(gruppe, gjeldendeMiljo(), testInfo.parallelIndex);

    testInfo.annotations.push({
        type: "testperson",
        description: `${gruppe} nummer ${testInfo.parallelIndex}: ${bruker.pid}`,
    });

    return bruker;
}
