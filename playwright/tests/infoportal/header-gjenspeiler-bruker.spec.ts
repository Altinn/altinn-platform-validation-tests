import { test } from "../../fixtures/test";
import { runInEnvironment } from "../../miljo";

runInEnvironment("at23", "tt02");

test.use({ testbrukerPath: "privatPersonUtenVirksomhet" });

test("Infoportalens header gjenspeiler pålogget bruker og valgt aktør etter navigering ut fra arbeidsflate", async ({
  innlogging,
  user,
  arbeidsflate,
  infoportal,
}) => {
  await test.step("Bruker logger inn på arbeidsflate", async () => {
    await innlogging.logIn(arbeidsflate.forside, user);
    await arbeidsflate.forside.assertLoggedIn();
  });

  await test.step("Bruker navigerer ut til infoportalen", async () => {
    await infoportal.forside.navigateTo();
  });

  await test.step("Infoportalens header viser pålogget bruker som valgt aktør", async () => {
    await infoportal.forside.assertLoggedIn(user);
  });
});
