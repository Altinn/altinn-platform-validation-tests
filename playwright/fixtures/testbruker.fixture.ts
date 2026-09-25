import type { TestInfo } from "@playwright/test";

import { getTestUser, TestUser } from "../config/testdata";
import type { Miljo } from "../miljo";
import { Testbruker } from "../testdata";
import { test as miljoTest } from "./miljo.fixture";

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
function testperson(gruppe: Testbruker) {
    return async (
        { miljo }: { miljo: Miljo },
        use: (bruker: TestUser) => Promise<void>,
        testInfo: TestInfo,
    ) => {
        const bruker = getTestUser(gruppe, miljo, testInfo.parallelIndex);

        testInfo.annotations.push({
            type: "testperson",
            description: `${gruppe} nummer ${testInfo.parallelIndex}: ${bruker.pid}`,
        });

        await use(bruker);
    };
}

export const test = miljoTest.extend<{ privatPerson: TestUser; dagligLeder: TestUser }>({
    /** Privatperson uten roller i en virksomhet, se testdata/privatPersonUtenVirksomhet. */
    privatPerson: testperson(Testbruker.PrivatPersonUtenVirksomhet),
    /** Daglig leder i en virksomhet, se testdata/dagligLeder. */
    dagligLeder: testperson(Testbruker.DagligLeder),
});
