import { test, Flate } from "../../fixtures/test";
import { runInEnvironment } from "../../miljo";

// Innloggingen bruker ID-porten med TestID i testmiljøene og Mockporten i prod.
runInEnvironment("at23", "tt02", "prod");

test.use({ testbrukerPath: "privatPersonUtenVirksomhet" });

const flater: Flate[] = [
  "arbeidsflate",
  "arbeidsflate-profil",
  "tilgangsstyring",
  "infoportalen",
];

for (const start of flater) {
  // Det testen verifiserer er at sesjonen gjelder på tvers av flatene og tåler refresh.
  test(`Bruker forblir innlogget på alle flater etter innlogging fra ${start}`, async ({
    innlogging,
    user,
    sider,
  }) => {
    await test.step(`Bruker logger inn og lander på ${start}`, async () => {
      await innlogging.logIn(sider[start], user);
      await sider[start].assertLoggedIn(user);
    });

    await test.step("Bruker er innlogget på de andre flatene, også etter refresh", async () => {
      for (const flate of flater.filter((f) => f !== start)) {
        await sider[flate].navigateTo();
        await sider[flate].assertLoggedIn(user);

        await innlogging.refresh();
        await sider[flate].assertLoggedIn(user);
      }
    });
  });
}
