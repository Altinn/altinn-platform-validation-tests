import { Testbruker } from "../../testdata";
import { test } from "../../fixtures/test";
import { miljoer } from "../../miljo";
import { alleSprak } from "../../config/sprak";

test.use({ testbrukerPath: Testbruker.PrivatPersonUtenVirksomhet });

test.describe(
  "Språkvalg fra profilen i infoportalen",
  miljoer("at23", "tt02"),
  () => {
    for (const sprak of alleSprak) {
      test(`Brukerens språkvalg fra profilen vises i infoportalen på ${sprak}`, async ({
        innlogging,
        user,
        tilgangsstyring,
        infoportal,
      }) => {
        await test.step(`Bruker logger inn og setter språk til ${sprak}`, async () => {
          await innlogging.logIn(tilgangsstyring.forside, user);
          await innlogging.setLanguage(sprak);
        });

        await test.step("Bruker navigerer til infoportalen", async () => {
          await infoportal.forside.navigateTo();
        });

        await test.step(`Infoportalen viser innhold på ${sprak}`, async () => {
          await infoportal.forside.assertSprak(sprak);
        });
      });
    }
  },
);
