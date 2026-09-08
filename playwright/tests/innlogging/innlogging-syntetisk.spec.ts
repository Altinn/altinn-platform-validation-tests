import { test } from "../../fixtures/test";
import { runInEnvironment } from "../../miljo";

runInEnvironment("at23", "tt02", "prod");

test("Bruker blir innlogget som syntetisk testbruker", async ({
  innlogging,
  user,
  arbeidsflate,
}) => {
  await test.step("Bruker logger inn uten ID-porten-skjermbildene", async () => {
    await innlogging.viaSyntetisk(arbeidsflate.forside, user);
  });

  await test.step("Bruker er innlogget på arbeidsflaten", async () => {
    await arbeidsflate.forside.assertLoggedIn();
  });
});
