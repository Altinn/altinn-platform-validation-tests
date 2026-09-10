import { test } from "../../fixtures/test";
import { runInEnvironment } from "../../miljo";

runInEnvironment("at22", "at23", "tt02", "prod");

test.use({ testbrukerPath: "privatPersonUtenVirksomhet" });

test("Mockporten gir en innlogget sesjon på tvers av flatene", async ({
  innlogging,
  user,
  sider,
}) => {
  await test.step("Logger inn med Mockporten", async () => {
    await innlogging.viaMockporten(sider.arbeidsflate, user);
    await sider.arbeidsflate.assertLoggedIn(user);
  });

  await test.step("Sesjonen gjelder på alle flatene", async () => {
    for (const side of Object.values(sider)) {
      await side.navigateTo();
      await side.assertLoggedIn(user);
    }
  });
});
