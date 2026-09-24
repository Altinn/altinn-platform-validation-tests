import { test as miljoTest } from "./miljo.fixture";
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
export const test = miljoTest.extend<{ testbrukerPath: Testbruker; user: TestUser }>({
  testbrukerPath: [Testbruker.PrivatPersonUtenVirksomhet, { option: true }],

  user: async ({ testbrukerPath, miljo }, use, testInfo) => {
    const bruker = getTestUser(testbrukerPath, miljo, testInfo.parallelIndex);

    testInfo.annotations.push({
      type: "testperson",
      description: `${testbrukerPath} nummer ${testInfo.parallelIndex}: ${bruker.pid}`,
    });

    await use(bruker);
  },
});
