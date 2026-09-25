import { test as base, TestInfo } from "@playwright/test";

import type { TestUser } from "../config/environment";
import { getTestUser } from "../config/testdata";
import { gjeldendeMiljo } from "../miljo";
import { Testbruker } from "../testdata";

/**
 *
 * Brukes på følgende måte:
 *
 *   test("...", async ({ innlogging, dagligLeder }) => { ... });
 *

 */
export const test = base.extend<{
    privatPerson: TestUser;
    dagligLeder: TestUser;
}>({
    /** Privatperson uten roller i en virksomhet, se testdata/privatPersonUtenVirksomhet. */
    privatPerson: async ({}, use, testInfo) => {
        await use(testperson(Testbruker.PrivatPersonUtenVirksomhet, testInfo));
    },
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
