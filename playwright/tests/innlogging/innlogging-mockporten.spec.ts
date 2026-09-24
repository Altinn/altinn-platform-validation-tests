import { Testbruker } from "../../testdata";
import { test, Flate } from "../../fixtures/test";
import { miljoer } from "../../miljo";

test.use({ testbrukerPath: Testbruker.PrivatPersonUtenVirksomhet });

const flater: Flate[] = [
  "arbeidsflate",
  "arbeidsflate-profil",
  "tilgangsstyring",
  "infoportalen",
];

for (const flate of flater) {
  test(
    `Bruker logger inn med Mockporten og lander innlogget på ${flate}`,
    miljoer("at23", "tt02", "prod"),
    async ({ innlogging, user, sider }) => {
      await innlogging.viaMockporten(sider[flate], user);
      await sider[flate].assertLoggedIn(user);
    },
  );
}
