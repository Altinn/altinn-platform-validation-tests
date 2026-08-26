import { testMedFlater as test, Flate } from "../../fixtures/test";
import { runInEnvironment } from "../../miljo";

// Endrer ingen data. Utloggingen går gjennom authentication /logout, som sender
// brukeren videre til /logout/handleloggedout, og det er de to endepunktene testen
// er her for. I prod går innloggingen via mockporten, siden TestID-skjermbildene
// bare finnes i testmiljøene.
runInEnvironment("at23", "tt02", "prod");

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
    flater: sider,
  }) => {
    await test.step(`Bruker logger inn og lander på ${start}`, async () => {
      await innlogging.logIn(sider[start], user);
      await sider[start].assertLoggedIn(user);
    });

    await test.step("Bruker logger ut", async () => {
      await innlogging.logOut();
      await innlogging.assertLoggedOut();
    });

    await test.step("Ingen av flatene viser brukeren som innlogget", async () => {
      for (const flate of flater) {
        await sider[flate].navigateTo();
        await sider[flate].assertLoggedOut(user);
      }
    });
  });
}
