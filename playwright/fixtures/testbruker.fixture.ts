import { test as base } from "@playwright/test";
import { getTestUser, TestUser } from "../config/testdata";
import { Testbruker } from "../testdata";

/**
 * Hvilken testperson en test kjører som. `testbrukerPath` velges fra Testbruker, som peker på mappen under testdata/,
 * og en test som trenger noe annet enn standarden sier det med
 * test.use({ testbrukerPath: Testbruker.DagligLeder }). Hvem hver test faktisk kjørte som
 * står i rapporten, som annotasjonen under legger inn.
 *
 * CSV-brukere fordeles med parallelIndex innenfor én kjøring.
 * Separate kjøringer deler brukerpool.
 */
export const test = base.extend<{ testbrukerPath: Testbruker; user: TestUser }>({
  testbrukerPath: [Testbruker.PrivatPersonUtenVirksomhet, { option: true }],

  user: async ({ testbrukerPath }, use, testInfo) => {
    const bruker = getTestUser(testbrukerPath, testInfo.parallelIndex);

    testInfo.annotations.push({
      type: "testperson",
      description: `${testbrukerPath} nummer ${testInfo.parallelIndex}: ${bruker.pid}`,
    });

    await use(bruker);
  },
});
