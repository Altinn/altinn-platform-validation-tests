import { test, Flate } from "../../fixtures/test";
import { runInEnvironment } from "../../miljo";

// Mockporten brukes til innlogging i prod, men har ikke en fungerende utloggingsside.
runInEnvironment("at23", "tt02");

test.use({ testbrukerPath: "privatPersonUtenVirksomhet" });

/**
 * Flatene som skal være utlogget etterpå. Infoportalen er med her, men ikke som
 * utgangspunkt: den er åpen og har ikke hovednavigasjonen utloggingen ligger i, så
 * den kan sjekkes men ikke logges ut fra.
 */
const flater: Flate[] = [
  "arbeidsflate",
  "arbeidsflate-profil",
  "tilgangsstyring",
  "infoportalen",
];

const utloggingsflater = flater.filter((flate) => flate !== "infoportalen");

for (const start of utloggingsflater) {
  // Sesjonen gjelder på tvers av flatene, så en utlogging fra én av dem skal ta
  // brukeren ut av alle.
  test(`Bruker er utlogget på alle flater etter utlogging fra ${start}`, async ({
    innlogging,
    user,
    sider,
  }) => {
    await test.step(`Bruker logger inn og lander på ${start}`, async () => {
      await innlogging.logIn(sider[start], user);
      await sider[start].assertLoggedIn(user);
    });

    await test.step("Bruker logger ut", async () => {
      await innlogging.logOut();
    });

    await test.step("Ingen av flatene viser brukeren som innlogget", async () => {
      for (const flate of flater) {
        await sider[flate].navigateTo();
        await sider[flate].assertLoggedOut(user);
      }
    });
  });
}
