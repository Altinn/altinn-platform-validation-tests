import { test as base } from "@playwright/test";
import { getTestUser, TestUser } from "../config/testdata";

/**
 * Hvilken testperson en test kjører som. `testbrukerPath` er stien under testdata/,
 * og en test som trenger noe annet enn standarden sier det med
 * test.use({ testbrukerPath: "dagligLeder" }). Hvem hver test faktisk kjørte som
 * står i rapporten, som annotasjonen under legger inn.
 *
 * CSV-brukere fordeles med parallelIndex innenfor én kjøring. Fallback til én
 * miljøkonfigurert person krever én worker. Separate kjøringer deler brukerpool.
 */
export const test = base.extend<{ testbrukerPath: string; user: TestUser }>({
  testbrukerPath: ["privatPersonUtenVirksomhet", { option: true }],

  user: async ({ testbrukerPath }, use, testInfo) => {
    const bruker = getTestUser(testbrukerPath, testInfo.parallelIndex, testInfo.config.workers);

    testInfo.annotations.push({
      type: "testperson",
      description: `${testbrukerPath} nummer ${testInfo.parallelIndex}: ${bruker.pid}`,
    });

    await use(bruker);
  },
});
