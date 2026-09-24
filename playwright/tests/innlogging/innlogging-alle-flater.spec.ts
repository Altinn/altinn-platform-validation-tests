import { Testbruker } from "../../testdata";
import { test, Flate } from "../../fixtures/test";
import { miljoer } from "../../miljo";

test.use({ testbrukerPath: Testbruker.PrivatPersonUtenVirksomhet });

const flater: { start: Flate; landing: Flate }[] = [
  { start: "arbeidsflate", landing: "arbeidsflate" },
  { start: "tilgangsstyring", landing: "tilgangsstyring" },
  { start: "infoportalen", landing: "arbeidsflate" },
  { start: "arbeidsflate-profil", landing: "arbeidsflate-profil" },
];

for (const { start, landing } of flater) {
  test(
    `Innlogget sesjon gjelder på tvers av flatene etter besøk på ${start}`,
    miljoer("at23", "tt02", "prod"),
    async ({ innlogging, user, sider }) => {
      await test.step(`Bruker går til ${start} uten å være logget inn`, async () => {
        await sider[start].navigateTo();
        if (start !== "infoportalen") {
          await innlogging.assertOnIdportenLogin();
        }
      });

      await test.step("Bruker logger inn", async () => {
        await innlogging.viaInnloggingsflyten(sider[landing], user);
      });

      await test.step(`Bruker skal være innlogget på ${landing}`, async () => {
        await sider[landing].assertLoggedIn(user);
      });

      await test.step("Bruker skal fortsatt være innlogget på de andre flatene", async () => {
        for (const flate of flater
          .map((f) => f.start)
          .filter((f) => f !== start)) {
          await sider[flate].navigateTo();
          await sider[flate].assertLoggedIn(user);
        }
      });
    },
  );
}
